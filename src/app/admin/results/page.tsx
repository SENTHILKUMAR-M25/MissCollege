import { getResults, getResultStats, getPassRateBySemester, getTopRankers, getResultFilters } from "@/actions/results"
import ResultsClient from "@/components/admin/results/ResultsClient"

export default async function ResultsPage() {
  const [results, stats, passRateBySem, topRankers, departments] = await Promise.all([
    getResults(),
    getResultStats(),
    getPassRateBySemester(),
    getTopRankers(5),
    getResultFilters(),
  ])

  return (
    <ResultsClient
      results={results}
      stats={stats}
      passRateBySem={passRateBySem}
      topRankers={topRankers}
      departments={departments}
    />
  )
}
