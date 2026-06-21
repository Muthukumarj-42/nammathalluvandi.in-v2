import { redirect } from "next/navigation";

export default function SearchCatalog() {
  // /search is deprecated in favor of /explore which has dynamic search and filters
  redirect("/explore");
}
