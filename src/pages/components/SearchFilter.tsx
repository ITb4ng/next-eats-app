import { CiSearch } from "react-icons/ci";
import { 
  REGION_ARR,
  ColourOption,
  colourOptions,
  FlavourOption,
  GroupedOption,
  groupedOptions,
 } from "@/data/region";
import React, { CSSProperties } from 'react';
import Select from 'react-select';


const groupStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
const groupBadgeStyles: CSSProperties = {
  backgroundColor: '#EBECF0',
  borderRadius: '2em',
  color: '#172B4D',
  display: 'inline-block',
  fontSize: 12,
  fontWeight: 'normal',
  lineHeight: '1',
  minWidth: 1,
  padding: '0.16666666666667em 0.5em',
  textAlign: 'center',
};

const formatGroupLabel = (data: GroupedOption) => (
  <div style={groupStyles}>
    <span>{data.label}</span>
    <span style={groupBadgeStyles}>{data.options.length}</span>
  </div>
);
 

export default function SearchFilter() {
    return (
      <div className="flex flex-col md:flex-row gap-2 my-4">
          <div className="flex items-center justify-center w-full">
            <CiSearch className="w-9 h-9 pr-3"/>
            <input 
              type="search" 
              placeholder="맛집 검색"
              className="block w-full p-2 text-base text-gray-800 border border-gray-300 rounded-lg bg-gray-100 focus:border-blue-500 outline-none"
            />
          </div>
          <Select<ColourOption | ColourOption, false, GroupedOption>
            defaultValue={colourOptions[1]}
            options={groupedOptions}
            formatGroupLabel={formatGroupLabel}
            />
      </div>
      
    );
}