// src/hooks/usePagination.ts

/**
 * Custom hook for pagination logic
 */

import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export const usePagination = ({
  totalItems,
  initialPageSize = 10,
  initialPage = 1,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);
  
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);
  
  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);
  
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };
  
  const nextPage = () => {
    goToPage(currentPage + 1);
  };
  
  const previousPage = () => {
    goToPage(currentPage - 1);
  };
  
  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };
  
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;
  
  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
    canGoNext,
    canGoPrevious,
  };
};

/**
 * Example usage:
 * 
 * const PatientsList = () => {
 *   const [patients, setPatients] = useState([...]);
 *   
 *   const pagination = usePagination({
 *     totalItems: patients.length,
 *     initialPageSize: 10,
 *   });
 *   
 *   const paginatedPatients = patients.slice(
 *     pagination.startIndex,
 *     pagination.endIndex
 *   );
 *   
 *   return (
 *     <div>
 *       {paginatedPatients.map(patient => (
 *         <PatientCard key={patient.id} patient={patient} />
 *       ))}
 *       
 *       <div>
 *         <button 
 *           onClick={pagination.previousPage}
 *           disabled={!pagination.canGoPrevious}
 *         >
 *           Previous
 *         </button>
 *         
 *         <span>
 *           Page {pagination.currentPage} of {pagination.totalPages}
 *         </span>
 *         
 *         <button 
 *           onClick={pagination.nextPage}
 *           disabled={!pagination.canGoNext}
 *         >
 *           Next
 *         </button>
 *       </div>
 *     </div>
 *   );
 * };
 */
