"use client";
import InfoBar from "@/components/admin/InfoBar";
import RightSideBar from "@/components/admin/RightSideBar";
import { SERVER_URL } from "@/lib/urql";
import { withUrqlClient } from "next-urql";
import React, { useEffect, useState } from "react";
import { cacheExchange, fetchExchange } from "urql";
import { Candidate, Category, Programme, Skill } from "@/gql/graphql";
import OneProgramme from "./SingleTeamList";
import { parseJwt } from "@/lib/cryptr";
import BulkUploadTeamList from "./BulkUploadTeamList";
import NormalUploadTeamList from "./NormalUploadTeamList";

interface Props {
  data: {
    title: string;
    icon: any;
  }[];
  result: Programme[];
  categories: Category[];
  skills: Skill[];
  candidates: Candidate[];
}

const TeamList = (props: Props) => {
  const [IsRightSideBarOpen, setIsRightSideBarOpen] = useState(false);
  const [SelectedProgramme, setSelectedProgramme] = useState<Programme>();
  const [isExcelUpload, setIsExcelUpload] = useState<boolean>(false);
  const [isExcelGroupUpload , setIsExcelGroupUpload] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [data, setData] = useState<Programme[]>(props.result);
  const [allData, setAllData] = useState<Programme[]>(props.result);
  const [isBulk, setIsBulk] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = IsRightSideBarOpen ? 12 : 16;

  useEffect(() => {
    const cookie = document.cookie;
    if (cookie) {
      const token = cookie.split("=")[1];
      const cv = parseJwt(token);
      setData(
        props.result.filter((item: any) =>
          cv.categories?.includes(item.category.name)
        ) as Programme[]
      );
      setAllData(
        props.result.filter((item: any) =>
          cv.categories?.includes(item.category.name)
        ) as Programme[]
      );
    }
  }, []);

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get the data for the current page
  const currentData = data.slice(startIndex, endIndex);

  // Calculate the total number of pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Go to a specific page number
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Render the pagination controls
  const renderPaginationControls = () => {
    const controls = [];
    for (let page = 1; page <= totalPages; page++) {
      controls.push(
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`${
            currentPage === page ? "bg-secondary text-white" : "bg-[#ECE1FC]"
          }  py-2 px-4 rounded-xl font-bold mx-1 my-5`}
        >
          {page}
        </button>
      );
    }
    return controls;
  };

  function downloadExcel() {
    const data = props.result;
    const replacer = (key: any, value: any) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map((row: any) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    csv.unshift(header.join(","));
    let csvArray = csv.join("\r\n");

    var a = document.createElement("a");
    a.href = "data:attachment/csv," + csvArray;
    a.target = "_Blank";
    a.download = "Programme.csv";
    document.body.appendChild(a);
    a.click();
  }

  return (
    <>
      <div className="w-full h-full">
        <InfoBar data={props.data} />

        <div className="w-full h-5/6 bg-base-200 rounded-lg mt-[1%]">
          <div>
            {/* search bar */}
            <div className="w-full h-10 bg-base-300 rounded-lg mt-[1%] cursor-pointer">
              <div className="w-1/3 h-full float-left">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                    setData(
                      allData.filter(
                        (item: Programme) =>
                          item.name
                            ?.toLocaleLowerCase()
                            .includes(e.target.value?.toLocaleLowerCase()) ||
                          item.programCode
                            ?.toLocaleLowerCase()
                            .includes(e.target.value?.toLocaleLowerCase())
                      )
                    );
                  }}
                />
              </div>
              <div className="m-1 float-left">
                <button
                  className="bg-blue-600"
                  onClick={() => {
                    setIsCreate(false);
                    setIsEdit(false);
                    setIsRightSideBarOpen(true);
                    setIsExcelUpload(true);
                    setIsExcelGroupUpload(false)
                  }}
                >
                  Import
                </button>
              </div>
              <div className="m-1 float-left">
                <button
                  className="bg-blue-600"
                  onClick={() => {
                    setIsCreate(false);
                    setIsEdit(false);
                    setIsRightSideBarOpen(true);
                    setIsExcelUpload(false);
                    setIsExcelGroupUpload(true)
                  }}
                >
                  Import Group
                </button>
              </div>
              <div className="m-1 float-left">
                <button className="bg-blue-600" onClick={downloadExcel}>
                  Export
                </button>
              </div>

              <div className="m-1 float-left">
                <input
                  type="checkbox"
                  className="toggle toggle-md"
                  checked={isBulk}
                  onChange={(e) => {
                    setIsRightSideBarOpen(false)
                    setIsBulk(e.target.checked);
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            {isBulk ? (
              <BulkUploadTeamList
                IsRightSideBarOpen={IsRightSideBarOpen}
                setIsRightSideBarOpen={setIsRightSideBarOpen}
                currentData={currentData}
                setIsCreate={setIsCreate}
                setIsEdit={setIsEdit}
                setIsExcelUpload={setIsExcelUpload}
                setSelectedProgramme={setSelectedProgramme}
                key={1}
                candidates={props.candidates}
              />
            ) : (
              <NormalUploadTeamList
                IsRightSideBarOpen={IsRightSideBarOpen}
                setIsRightSideBarOpen={setIsRightSideBarOpen}
                currentData={currentData}
                setIsCreate={setIsCreate}
                setIsEdit={setIsEdit}
                setIsExcelUpload={setIsExcelUpload}
                setSelectedProgramme={setSelectedProgramme}
                key={1}
              />
            )}
          </div>
          <div className="w-full flex items-center justify-center">
            {renderPaginationControls()}
          </div>
        </div>
      </div>
 
        <RightSideBar
        isCreate={isCreate}
        isEdit={isEdit}
        key={1}
        isOpen={IsRightSideBarOpen}
        setIsOpen={setIsRightSideBarOpen}
      >
        <OneProgramme
        selectedProgramme={SelectedProgramme as Programme}
          isExcelUpload={isExcelUpload}
          setIsExcelUpload={setIsExcelUpload}
          isOpen={IsRightSideBarOpen}
          setIsOpen={setIsRightSideBarOpen}
          key={3}
          name={SelectedProgramme?.name as string}
          id={SelectedProgramme?.id as number}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          isCreate={isCreate}
          setIsCreate={setIsCreate}
          data={allData}
          setData={setAllData}
          category={SelectedProgramme?.category?.name as string}
          skill={SelectedProgramme?.skill?.name as string}
          categories={props.categories}
          skills={props.skills}
          isExcelGroupUpload = {isExcelGroupUpload}
          setExcelGroupUpload={setIsExcelGroupUpload}
          allCandidates={props.candidates}
        />
      </RightSideBar>

      
    </>
  );
};

export default withUrqlClient(() => ({
  url: SERVER_URL,
  exchanges: [fetchExchange, cacheExchange],
  fetchOptions: {
    cache: "no-cache",
    credentials: "include",
  },
}))(TeamList);