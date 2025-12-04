import type { Route } from "./+types/home";
import { Link } from "react-router";
import { SQLitePlayground } from "~/components/SQLitePlayground";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function SQLite() {
  return(
    <>
        <h1>This is the playground 💝</h1>
        <Link to={'/'}>HOME</Link>

        <SQLitePlayground />
    </>
  );
}
