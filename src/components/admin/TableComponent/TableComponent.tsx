import React from 'react'

interface TableComponentProps {
  headings: string[];
  valueList?: any[];
}

const TableComponent: React.FC<TableComponentProps> = ({ headings, valueList }) => {
  return (
    <div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-adminprimary dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {headings.map((heading, index) => (
                <th key={index} scope="col" className="px-6 py-3">
                  {heading.charAt(0).toUpperCase() + heading.slice(1)}
                </th>
              ))}
              <th scope="col" className="px-6 py-3">
                status
              </th>
            </tr>
          </thead>
          <tbody>
            {valueList && valueList.length > 0 ? (
              valueList.map((item, itemIndex) => (
                <tr 
                  key={itemIndex} 
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  {headings.map((heading, headingIndex) => (
                    <td 
                      key={headingIndex} 
                      className="px-6 py-4"
                    >
                      {Array.isArray(item[heading])
                        ? item[heading].join(', ')
                        : item[heading] || 'N/A'}
                    </td>
                  ))}
                  <td>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={item['status'] === 1} 
            // onChange={() => } 
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
        </label>
      </td>
    </tr>

              ))
            ) : (
              <tr>
                <td colSpan={headings.length} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableComponent