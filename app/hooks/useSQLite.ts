import type { DbId } from "@sqlite.org/sqlite-wasm";
import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";
import { useState, useCallback, useRef } from "react";

const databaseConfig = {
  filename: "file:mydb.sqlite3?vfs=opfs",
  tables: {
    test: {
      name: "test_table",
      schema: `
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    },
  },
} as const;

export function useSQLite() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const [isInitialized, setIsInitialized] = useState<boolean>(false)

     const promiser = useRef<ReturnType<typeof sqlite3Worker1Promiser> | null>(null);
    const dbId = useRef<DbId | null>(null);

    const initialize = useCallback(async () => {
    if (isInitialized) return true;

    setIsLoading(true);
    setError(null);

    try {
      // Create worker promiser
      promiser.current = await new Promise(resolve => {
        const p = sqlite3Worker1Promiser({
          onready: () => resolve(p),
        });
      });

      if (!promiser.current) {
        throw new Error("Failed to initialize SQLite promiser");
      }

      // Open DB
      await promiser.current("config-get", {});
      const openResponse = await promiser.current("open", {
        filename: databaseConfig.filename,
      });

      if (openResponse.type === "error") {
        throw new Error(openResponse.result.message);
      }

      dbId.current = openResponse.result.dbId as DbId;

      // Create tables
      await promiser.current("exec", {
        dbId: dbId.current!,
        sql: databaseConfig.tables.test.schema,
      });

      setIsInitialized(true);
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      setError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // ---------------------------
  // Execute any SQL query
  // ---------------------------
  const executeQuery = useCallback(
    async (sql: string, params: unknown[] = []) => {
      if (!dbId.current || !promiser.current) {
        await initialize();
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await promiser.current!("exec", {
          dbId: dbId.current!,
          sql,
          bind: params,
          returnValue: "resultRows",
        });

        if (result.type === "error") {
          throw new Error(result.result.message);
        }

        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Query execution failed");
        setError(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [initialize]
  );

  return {
    isLoading,
    error,
    isInitialized,
    initialize,
    executeQuery,
  };
}