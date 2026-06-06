export const ALERT = {
  created: (entity: string) => `${entity} created successfully`,
  updated: (entity: string) => `${entity} updated successfully`,
  deleted: "Deleted successfully",
  deleteFailed: "Failed to delete",
  createFailed: (entity: string) => `Failed to create ${entity.toLowerCase()}`,
  updateFailed: (entity: string) => `Failed to update ${entity.toLowerCase()}`,
  suspendSuccess: (entity: string) => `${entity} suspended`,
  suspendFailed: (entity: string) => `Failed to suspend ${entity.toLowerCase()}`,
  validationTab: (tab: string) => `Please complete ${tab}.`,
}
