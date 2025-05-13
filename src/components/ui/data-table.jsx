import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

const DataTable = ({
  columns,
  data,
  itemsPerPage = 10,
  autoIndex = false,
  title,
  add,
  hideSearch = false,
  onRowClick,
  idAccessor,
  headerAction,
  tableCaption,
  isSelectable = false,
  selectedData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [selectedRows, setSelectedRows] = useState(new Set());

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedData = useMemo(() => {
    let sorted = [...data];
    if (sortColumn) {
      sorted.sort((a, b) => {
        const valA = typeof sortColumn === 'function' ? sortColumn(a) : a[sortColumn];
        const valB = typeof sortColumn === 'function' ? sortColumn(b) : b[sortColumn];

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [data, sortColumn, sortOrder]);

  const filteredData = useMemo(() => {
    return sortedData.filter(item =>
      columns.some(column =>
        column.accessor &&
        String(typeof column.accessor === 'function' ? column.accessor(item) : item[column.accessor])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, columns, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handleRowSelect = (rowIdentifier) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowIdentifier)) {
      newSelectedRows.delete(rowIdentifier);
    } else {
      newSelectedRows.add(rowIdentifier);
    }
    setSelectedRows(newSelectedRows);
    selectedData(Array.from(newSelectedRows).map(id => data.find(row => (idAccessor ? row[idAccessor] : row) === id)));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === currentItems.length) {
      setSelectedRows(new Set());
      console.log("Selected data: []");
    } else {
      const newSelectedRows = new Set(currentItems.map(row => idAccessor ? row[idAccessor] : row));
      setSelectedRows(newSelectedRows);
      selectedData(Array.from(newSelectedRows).map(id => data.find(row => (idAccessor ? row[idAccessor] : row) === id)));
    }
  };

  const renderPaginationItems = () => {
    let items = [];
    let maxVisiblePages;

    if (windowWidth < 640) {
      maxVisiblePages = 1;
    } else if (windowWidth < 768) {
      maxVisiblePages = 2;
    } else {
      maxVisiblePages = 3;
    }

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > maxVisiblePages) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
      }

      const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(start + maxVisiblePages - 1, totalPages - 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (end < totalPages - 1) {
        items.push(<PaginationEllipsis key="ellipsis-end" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const isMobile = windowWidth < 640;

  const truncateText = (text, maxLength = 50) => {
    if (typeof text !== 'string') return text;
    if (text.length <= maxLength) return text;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span>{text.slice(0, maxLength)}...</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs whitespace-normal">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div>
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start sm:items-center mb-4`}>
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
            {title && <h2 className="text-xl font-bold p-3">{title}</h2>}
          {add && add}
          {headerAction && headerAction}
        </div>
        <div className="flex w-full p-3 md:w-1/2 md:justify-end">
          {!hideSearch && data.length > 0 && (
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className={`${isMobile ? 'w-full' : 'max-w-xs'}`}
            />
          )}
        </div>
      </div>
      {filteredData.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              {tableCaption && <TableCaption>{tableCaption}</TableCaption>}
              <TableHeader>
                <TableRow>
                  {isSelectable && (
                    <TableHead>
                      <Checkbox
                        checked={selectedRows.size === currentItems.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {autoIndex && <TableHead>#</TableHead>}
                  {columns.map((column, index) =>
                    (!isMobile || !column.hiddenOnMobile) && (
                      <TableHead
                        key={index}
                        onClick={() => column.sortable && handleSort(column.accessor)}
                        className={column.sortable ? 'cursor-pointer' : ''}
                      >
                        <div className="flex items-center gap-1">
                          {column.header}
                          {column.sortable && <ChevronsUpDown className="h-4 w-4" />}
                        </div>
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((row, rowIndex) => {
                  const rowIdentifier = idAccessor ? row[idAccessor] : row;
                  return (
                    <TableRow
                      key={rowIndex}
                      onClick={() => {
                        if (onRowClick) onRowClick(rowIdentifier);
                      }}
                      className={onRowClick ? 'cursor-pointer' : ''}
                    >
                      {isSelectable && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(rowIdentifier)}
                            onCheckedChange={() => handleRowSelect(rowIdentifier)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {autoIndex && (
                        <TableCell>
                          {(currentPage - 1) * itemsPerPage + rowIndex + 1}
                        </TableCell>
                      )}
                      {columns.map((column, colIndex) =>
                        (!isMobile || !column.hiddenOnMobile) && (
                          <TableCell
                            key={colIndex}
                            className={typeof column.className === 'function' ? column.className(row) : column.className || ''}
                          >
                            {truncateText(column.cell ? column.cell(row) : (typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor]))}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {totalPages >= 2 && (
            <div className="overflow-x-auto">
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">No data found</div>
      )}
    </div>
  );
};

export default DataTable;