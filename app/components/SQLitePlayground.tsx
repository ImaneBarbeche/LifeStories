import { useState } from "react";
// import { useSQLite } from "@/hooks/useSQLite";
import { useSQLite } from "../hooks/useSQLite";

export function SQLitePlayground() {
  const { isLoading, error, executeQuery } = useSQLite();

  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM test_table");
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Example queries
  const exampleQueries = [
    { title: "Select all", query: "SELECT * FROM test_table" },
    {
      title: "Insert",
      query: "INSERT INTO test_table (name) VALUES ('New Test Item')",
    },
    {
      title: "Update",
      query: "UPDATE test_table SET name = 'Updated Item' WHERE name LIKE 'New%'",
    },
    {
      title: "Delete",
      query: "DELETE FROM test_table WHERE name = 'Updated Item'",
    },
  ] as const;

  // Run SQL query
  const runQuery = async () => {
    setQueryError(null);
    setQueryResult([]);

    try {
      const result = await executeQuery(sqlQuery);
      const isSelect = sqlQuery.trim().toLowerCase().startsWith("select");

      if (isSelect) {
        setQueryResult(result?.result?.resultRows ?? []);
      } else {
        // Re-fetch after INSERT/UPDATE/DELETE
        const updated = await executeQuery("SELECT * FROM test_table");
        setQueryResult(updated?.result?.resultRows ?? []);
      }
    } catch (err: any) {
      setQueryError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="text-2xl font-bold">SQLite Playground</h2>

      {/* Example Queries */}
      <div className="mt-4">
        <h3 className="text-sm font-medium">Example Queries:</h3>
        <div className="mt-2 flex gap-2">
          {exampleQueries.map((ex) => (
            <button
              key={ex.title}
              className="rounded-full bg-blue-500 px-3 py-1 text-sm hover:bg-blue-600"
              onClick={() => setSqlQuery(ex.query)}
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input */}
      <div className="mt-6">
        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          rows={4}
          className="w-full rounded-lg px-4 py-3 font-mono text-sm"
          disabled={isLoading}
        />

        <button
          disabled={isLoading}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
          onClick={runQuery}
        >
          {isLoading ? "Running..." : "Run Query"}
        </button>
      </div>

      {/* Error display */}
      {(error || queryError) && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-600">
          {error?.message || queryError}
        </div>
      )}

      {/* Results table */}
      {queryResult.length && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Results:</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {Object.keys(queryResult[0]).map((col) => (
                    <th key={col} className="px-4 py-2 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResult.map((row, i) => (
                  <tr key={i}>
                    {Object.keys(row).map((col) => (
                      <td key={col} className="px-4 py-2">
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
