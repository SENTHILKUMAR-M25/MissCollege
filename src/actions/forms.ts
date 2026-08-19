"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { FormFieldType, RecordStatus } from "@prisma/client"

export async function createForm(data: {
  name: string
  description?: string
  createdBy: string
  fields: Array<{
    label: string
    type: FormFieldType
    required: boolean
    options?: string[]
    order: number
    unique?: boolean
  }>
  status?: RecordStatus
}) {
  try {
    const { name, description, createdBy, fields, status } = data

    if (!name || !createdBy || !fields?.length) {
      return { success: false, error: "Name, creator, and at least one field are required" }
    }

    const form = await prisma.form.create({
      data: {
        name,
        description,
        createdBy,
        status: status || RecordStatus.ACTIVE,
        fields: {
          create: fields.map((f) => ({
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options,
            order: f.order,
            unique: f.unique || false,
          })),
        },
      },
      include: { fields: true },
    })

    revalidatePath("/admin/forms")
    return { success: true, data: form }
  } catch (error: any) {
    console.error("createForm error:", error)
    return { success: false, error: error.message || "Failed to create form" }
  }
}

export async function updateForm(formId: string, data: {
  name?: string
  description?: string
  status?: RecordStatus
  fields?: Array<{
    id?: string
    label: string
    type: FormFieldType
    required: boolean
    options?: string[]
    order: number
    unique?: boolean
  }>
}) {
  try {
    const form = await prisma.form.findUnique({ where: { id: formId } })
    if (!form) return { success: false, error: "Form not found" }

    const updated = await prisma.$transaction(async (tx) => {
      const formUpdate: any = {}
      if (data.name !== undefined) formUpdate.name = data.name
      if (data.description !== undefined) formUpdate.description = data.description
      if (data.status !== undefined) formUpdate.status = data.status

      const form = await tx.form.update({
        where: { id: formId },
        data: formUpdate,
        include: { fields: { orderBy: { order: "asc" } } },
      })

      if (data.fields) {
        const existingIds = new Set((form.fields ?? []).map((f) => f.id))
        const submittedIds = new Set(data.fields.filter((f) => f.id).map((f) => f.id as string))

        await tx.formField.deleteMany({
          where: { formId, id: { notIn: Array.from(submittedIds) } },
        })

        await Promise.all(
          data.fields.map((f) => {
            if (f.id && existingIds.has(f.id)) {
              return tx.formField.update({
                where: { id: f.id },
                data: {
                  label: f.label,
                  type: f.type,
                  required: f.required,
                  options: f.options,
                  order: f.order,
                  unique: f.unique,
                },
              })
            }
            return tx.formField.create({
              data: {
                formId,
                label: f.label,
                type: f.type,
                required: f.required,
                options: f.options,
                order: f.order,
                unique: f.unique || false,
              },
            })
          })
        )
      }

      return tx.form.findUnique({
        where: { id: formId },
        include: { fields: { orderBy: { order: "asc" } } },
      })
    })

    revalidatePath("/admin/forms")
    return { success: true, data: updated }
  } catch (error: any) {
    console.error("updateForm error:", error)
    return { success: false, error: error.message || "Failed to update form" }
  }
}

export async function deleteForm(formId: string) {
  try {
    await prisma.form.delete({ where: { id: formId } })
    revalidatePath("/admin/forms")
    return { success: true }
  } catch (error: any) {
    console.error("deleteForm error:", error)
    return { success: false, error: error.message || "Failed to delete form" }
  }
}

export async function getForm(formId: string) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { fields: { orderBy: { order: "asc" } }, records: { orderBy: { createdAt: "desc" } } },
    })
    if (!form) return { success: false, error: "Form not found" }
    return { success: true, data: form }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load form" }
  }
}

export async function listForms() {
  try {
    const forms = await prisma.form.findMany({
      include: { fields: { orderBy: { order: "asc" } }, _count: { select: { records: true } } },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: forms }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load forms" }
  }
}

function buildUniqueWhere(fields: Array<{ id: string; unique: boolean; label: string }>, values: Record<string, any>) {
  const uniqueFields = fields.filter((f) => f.unique)
  if (!uniqueFields.length) return {}

  const where: any = { formId: undefined, fieldValues: {} }
  for (const f of uniqueFields) {
    const val = values[f.label]
    if (val === undefined || val === null || val === "") continue
    if (!where.fieldValues.AND) where.fieldValues.AND = []
    where.fieldValues.AND.push({ fieldId: f.id, value: String(val) })
  }
  return where
}

export async function submitFormRecord(formId: string, values: Record<string, any>, submittedBy?: string) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { fields: { orderBy: { order: "asc" } } },
    })
    if (!form) return { success: false, error: "Form not found" }
    if (form.status !== "ACTIVE") return { success: false, error: "This form is currently closed" }

    const requiredFields = form.fields.filter((f) => f.required)
    for (const f of requiredFields) {
      const val = values[f.label]
      if (val === undefined || val === null || String(val).trim() === "") {
        return { success: false, error: `${f.label} is required` }
      }
    }

    const uniqueWhere = buildUniqueWhere(form.fields, values)
    if (Object.keys(uniqueWhere).length) {
      const existing = await prisma.formRecord.findFirst({
        where: {
          formId,
          status: "ACTIVE",
          ...uniqueWhere,
        },
      })
      if (existing) {
        return { success: false, error: "A matching record already exists" }
      }
    }

    const fieldValuesData = form.fields.map((f) => ({
      fieldId: f.id,
      fieldLabel: f.label,
      value: values[f.label] === undefined || values[f.label] === null ? null : String(values[f.label]),
    }))

    const record = await prisma.formRecord.create({
      data: {
        formId,
        submittedBy,
        status: "ACTIVE",
        fieldValues: { create: fieldValuesData },
      },
      include: { fieldValues: true },
    })

    revalidatePath(`/forms/${formId}`)
    return { success: true, data: record }
  } catch (error: any) {
    console.error("submitFormRecord error:", error)
    return { success: false, error: error.message || "Failed to submit form" }
  }
}

export async function updateFormRecord(recordId: string, values: Record<string, any>) {
  try {
    const existing = await prisma.formRecord.findUnique({
      where: { id: recordId },
      include: { form: { include: { fields: true } } },
    })
    if (!existing) return { success: false, error: "Record not found" }

    const form = existing.form
    const requiredFields = form.fields.filter((f) => f.required)
    for (const f of requiredFields) {
      const val = values[f.label]
      if (val === undefined || val === null || String(val).trim() === "") {
        return { success: false, error: `${f.label} is required` }
      }
    }

    const uniqueWhere = buildUniqueWhere(form.fields, values)
    if (Object.keys(uniqueWhere).length) {
      const duplicate = await prisma.formRecord.findFirst({
        where: {
          formId: form.id,
          status: "ACTIVE",
          id: { not: recordId },
          ...uniqueWhere,
        },
      })
      if (duplicate) {
        return { success: false, error: "A matching record already exists" }
      }
    }

    const record = await prisma.$transaction(async (tx) => {
      await tx.formFieldValue.deleteMany({ where: { recordId } })

      const fieldValuesData = form.fields.map((f) => ({
        fieldId: f.id,
        fieldLabel: f.label,
        value: values[f.label] === undefined || values[f.label] === null ? null : String(values[f.label]),
      }))

      return tx.formRecord.update({
        where: { id: recordId },
        data: {
          status: "ACTIVE",
          fieldValues: { create: fieldValuesData },
        },
        include: { fieldValues: true },
      })
    })

    revalidatePath(`/admin/forms/${form.id}`)
    return { success: true, data: record }
  } catch (error: any) {
    console.error("updateFormRecord error:", error)
    return { success: false, error: error.message || "Failed to update record" }
  }
}

export async function deleteFormRecord(recordId: string) {
  try {
    const record = await prisma.formRecord.findUnique({ where: { id: recordId } })
    if (!record) return { success: false, error: "Record not found" }

    await prisma.formRecord.delete({ where: { id: recordId } })
    revalidatePath(`/admin/forms/${record.formId}`)
    return { success: true }
  } catch (error: any) {
    console.error("deleteFormRecord error:", error)
    return { success: false, error: error.message || "Failed to delete record" }
  }
}

export async function archiveFormRecord(recordId: string) {
  try {
    const record = await prisma.formRecord.findUnique({ where: { id: recordId } })
    if (!record) return { success: false, error: "Record not found" }

    const updated = await prisma.formRecord.update({
      where: { id: recordId },
      data: { status: "ARCHIVED" },
    })

    revalidatePath(`/admin/forms/${record.formId}`)
    return { success: true, data: updated }
  } catch (error: any) {
    console.error("archiveFormRecord error:", error)
    return { success: false, error: error.message || "Failed to archive record" }
  }
}

export async function getFormRecords(formId: string) {
  try {
    const records = await prisma.formRecord.findMany({
      where: { formId },
      include: { fieldValues: { orderBy: { id: "asc" } } },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: records }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load records" }
  }
}
