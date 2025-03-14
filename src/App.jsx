import { AppSidebar } from "@/components/app-sidebar"
import { useState } from "react";
import SearchPage from "./components/search-algos";
import SortingPage from "./components/sorting-algos";
import Lcs from "./components/lcs"
import SubsetSumSolver from "./components/subset";
import CombinationSolver from "./components/combina";

import GraphPage from "./components/graph-algos";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function App() {
  const [data, setData] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  return (
    <SidebarProvider>
      <AppSidebar setData={setData} setSelectedAlgorithm={setSelectedAlgorithm} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                {data}
                </BreadcrumbLink>
              </BreadcrumbItem>

            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
  <div className="grid auto-rows-min gap-4 md:grid-cols-1 lg:grid-cols-1">
    <div className="rounded-xl bg-muted/50 flex items-center justify-center">
    {selectedAlgorithm === 1 ? (
  <div className="w-full">
    <SortingPage />
  </div>
) : selectedAlgorithm === 2 ? (
  <div className="w-full">
    <SearchPage />
  </div>
) : selectedAlgorithm === 3 ? (
  <div className="w-full">
    <GraphPage />
  </div>
) :selectedAlgorithm === "lcs" ? (
  <div className="w-full">
    <Lcs />
  </div>
) :selectedAlgorithm === "combi" ? (
  <div className="w-full">
    <CombinationSolver />
  </div>
) :selectedAlgorithm === "subset" ? (
  <div className="w-full">
    <SubsetSumSolver />
  </div>
) : (
  <p className="text-center text-lg font-semibold text-gray-500">
    Select an algorithm from the sidebar
  </p>
)}

    </div>


  </div>


</div>

      </SidebarInset>
    </SidebarProvider>
  )
}
