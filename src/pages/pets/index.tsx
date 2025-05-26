import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { getAllPets } from '../../utils/api';
import { getPetsBySpecies, type Pet as ServicePet } from '../../services/petService';
import MainLayout from '../../components/layouts/MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface Pet extends ServicePet {
  color: string;
  size: string;
}

interface PetsResponse {
  pets: Pet[];
  totalPages: number;
  currentPage: number;
  totalPets: number;
}

const PetsPage: NextPage = () => {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPets, setTotalPets] = useState(0);
  const petsPerPage = 9;

  // Filter states
  const [filters, setFilters] = useState({
    gender: '',
    color: '',
    size: '',
    minPrice: '',
    maxPrice: '',
    species: ''
  });

  // Fetch pets when the page loads or URL parameters change
  useEffect(() => {
    // Only run when router is ready
    if (!router.isReady) return;
    
    // Get species from URL if available
    const { species, page } = router.query;
    
    // Set current page if provided in URL
    if (page && typeof page === 'string') {
      const pageNum = parseInt(page);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
    
    // Set species filter if provided in URL
    const newFilters = { ...filters };
    if (species && typeof species === 'string') {
      newFilters.species = species;
    } else {
      newFilters.species = '';
    }
    setFilters(newFilters);
    
    // Fetch data
    fetchPets(newFilters, currentPage);
    
  }, [router.isReady, router.query]);

  // Separate function to fetch pets
  const fetchPets = async (currentFilters: typeof filters, page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Nếu có species, sử dụng getPetsBySpecies để lấy dữ liệu trực tiếp từ endpoint species
      if (currentFilters.species) {
        console.log(`Using getPetsBySpecies for species: ${currentFilters.species}`);
        const allPetsOfSpecies = await getPetsBySpecies(currentFilters.species);
        console.log(`Received ${allPetsOfSpecies.length} pets from species API`);
        
        // Lọc tiếp theo các bộ lọc khác
        let filteredPets = [...allPetsOfSpecies] as Pet[];
        
        if (currentFilters.gender) {
          filteredPets = filteredPets.filter(pet => pet.gender === currentFilters.gender);
        }
        if (currentFilters.color) {
          filteredPets = filteredPets.filter(pet => pet.color === currentFilters.color);
        }
        if (currentFilters.size) {
          filteredPets = filteredPets.filter(pet => pet.size === currentFilters.size);
        }
        if (currentFilters.minPrice) {
          filteredPets = filteredPets.filter(pet => pet.price >= Number(currentFilters.minPrice));
        }
        if (currentFilters.maxPrice) {
          filteredPets = filteredPets.filter(pet => pet.price <= Number(currentFilters.maxPrice));
        }
        
        // Lưu tất cả thú cưng đã lọc để xử lý phân trang
        const totalFilteredPets = filteredPets.length;
        
        // Phân trang
        const startIndex = (page - 1) * petsPerPage;
        const endIndex = startIndex + petsPerPage;
        const paginatedPets = filteredPets.slice(startIndex, endIndex);
        
        setPets(paginatedPets);
        setTotalPages(Math.ceil(totalFilteredPets / petsPerPage));
        setTotalPets(totalFilteredPets);
        setCurrentPage(page);
      } else {
        // Sử dụng getAllPets với tham số nếu không có species cụ thể
        const params: any = {
          page: page,
          limit: petsPerPage
        };

        // Add filters if they are set
        if (currentFilters.gender) params.gender = currentFilters.gender;
        if (currentFilters.color) params.color = currentFilters.color;
        if (currentFilters.size) params.size = currentFilters.size;
        if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
        if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;

        const response = await getAllPets(params);
        
        if ('pets' in response) {
          // Response with pagination
          const paginatedResponse = response as PetsResponse;
          setPets(paginatedResponse.pets);
          setTotalPages(paginatedResponse.totalPages);
          setTotalPets(paginatedResponse.totalPets || 0);
          setCurrentPage(page);
        } else {
          // Direct array response (fallback)
          const allPets = response as Pet[];
          setPets(allPets.slice((page - 1) * petsPerPage, page * petsPerPage));
          setTotalPages(Math.ceil(allPets.length / petsPerPage));
          setTotalPets(allPets.length);
          setCurrentPage(page);
        }
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('Không thể tải danh sách thú cưng. Vui lòng thử lại sau.');
      setPets([]);
      setTotalPages(1);
      setTotalPets(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    const newFilters = { ...filters };
    
    if (type === 'checkbox') {
      // Handle checkbox filter
      newFilters[name as keyof typeof filters] = checked ? value : '';
    } else {
      // Handle other filter types
      newFilters[name as keyof typeof filters] = value;
    }
    
    setFilters(newFilters);
    
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Fetch data with new filters
    fetchPets(newFilters, 1);
  };

  const clearFilters = () => {
    const emptyFilters = {
      gender: '',
      color: '',
      size: '',
      minPrice: '',
      maxPrice: '',
      species: ''
    };
    
    setFilters(emptyFilters);
    setCurrentPage(1);
    
    // Update URL to remove species parameter
    router.push('/pets', undefined, { shallow: true });
    
    // Fetch data with cleared filters
    fetchPets(emptyFilters, 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      // Cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Cập nhật URL nếu cần
      if (filters.species) {
        const newUrl = `/pets?species=${encodeURIComponent(filters.species)}&page=${newPage}`;
        router.push(newUrl, undefined, { shallow: true });
      } else {
        router.push(`/pets?page=${newPage}`, undefined, { shallow: true });
      }
      
      // Fetch data with the new page
      fetchPets(filters, newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // Cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Cập nhật URL nếu cần
      if (filters.species) {
        const newUrl = `/pets?species=${encodeURIComponent(filters.species)}&page=${newPage}`;
        router.push(newUrl, undefined, { shallow: true });
      } else {
        router.push(`/pets?page=${newPage}`, undefined, { shallow: true });
      }
      
      // Fetch data with the new page
      fetchPets(filters, newPage);
    }
  };

  // Format price with dots (.) as thousand separators
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Cuộn lên đầu trang khi currentPage thay đổi
  useEffect(() => {
    // Chỉ áp dụng khi không phải lần render đầu tiên và có dữ liệu
    if (pets.length > 0) {
      // Dùng setTimeout để đảm bảo DOM đã render xong
      setTimeout(() => {
        // Cuộn lên đầu nội dung sản phẩm
        const petsList = document.getElementById('pets-list-content');
        if (petsList) {
          const yOffset = -100; // Điều chỉnh offset để thấy được tiêu đề
          const y = petsList.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          // Fallback: cuộn lên đầu trang
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [currentPage, pets.length]);

  return (
    <MainLayout>
      <Head>
        <title>
          {filters.species 
            ? `${filters.species} - Thú cưng | Monitö` 
            : `Danh sách sản phẩm - Thú cưng | Monitö`}
        </title>
        <meta
          name="description"
          content={filters.species 
            ? `Danh sách ${filters.species} tại cửa hàng thú cưng Monitö` 
            : "Khám phá các loại thú cưng của chúng tôi"}
        />
      </Head>

      {/* Hero banner */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
                Thêm Một Bạn
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                Thêm Ngàn Niềm Vui!
              </h2>
              <p className="text-slate-600 mb-6 max-w-lg">
                Chú mèo cưng đáng yêu sẽ cải thiện tâm trạng của bạn mỗi ngày.
                Chúng tôi sẽ giúp bạn tìm người bạn thú cưng phù hợp với gia
                đình bạn.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/about"
                  className="px-6 py-2 border border-slate-800 text-slate-800 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Giới Thiệu
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors"
                >
                  Khám Phá Ngay
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="relative h-64 md:h-80">
                <Image
                  src="/images/hero-pet.png"
                  alt="Thú cưng"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#00171F]">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link href="/pets" className="hover:text-[#00171F]">
              Thú cưng
            </Link>
            {filters.species && (
              <>
                <span className="mx-2">/</span>
                <span className="text-[#00171F] font-medium">
                  {filters.species}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters - Left Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 flex items-center">
                    <FontAwesomeIcon
                      icon={faFilter}
                      className="mr-2 text-[#00171F]"
                    />
                    Bộ lọc
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#00171F] font-[900] hover:text-amber-700"
                  >
                    Xóa lọc
                  </button>
                </div>

                {/* Gender Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 mb-3">Giống</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="gender"
                        value="Đực"
                        checked={filters.gender === "Đực"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Đực</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="gender"
                        value="Cái"
                        checked={filters.gender === "Cái"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Cái</span>
                    </label>
                  </div>
                </div>

                {/* Color Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 mb-3">Màu sắc</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="color"
                        value="Vàng"
                        checked={filters.color === "Vàng"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Vàng</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="color"
                        value="Đen"
                        checked={filters.color === "Đen"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Đen</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="color"
                        value="Trắng"
                        checked={filters.color === "Trắng"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Trắng</span>
                    </label>
                  </div>
                </div>

                {/* Size Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 mb-3">Kích thước</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="size"
                        value="Nhỏ"
                        checked={filters.size === "Nhỏ"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Nhỏ</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="size"
                        value="Vừa"
                        checked={filters.size === "Vừa"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Vừa</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="size"
                        value="Lớn"
                        checked={filters.size === "Lớn"}
                        onChange={handleFilterChange}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-gray-700">Lớn</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Pet Listings */}
            <div className="flex-1">
              <h2 id="pets-list-content" className="text-2xl font-bold text-slate-800 mb-6">
                {filters.species ? filters.species : "Tất cả thú cưng"}
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : pets.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
                  <p>Không tìm thấy thú cưng nào phù hợp với bộ lọc.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                      <Link
                        href={`/pets/${pet._id}`}
                        key={pet._id}
                        className="group"
                      >
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group-hover:translate-y-[-5px]">
                          <div className="relative h-52 overflow-hidden">
                            <img
                              src={
                                pet.image?.url || "/images/pet-placeholder.jpg"
                              }
                              alt={pet.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-slate-800">
                                {pet.code} - {pet.name}
                              </h3>
                            </div>
                            <div className="flex flex-wrap text-sm text-gray-600 gap-4 mt-2">
                              <div className="flex items-center">
                                <span className="text-gray-500">Giống:</span>
                                <span className="ml-1 font-medium">
                                  {pet.gender}
                                </span>
                              </div>

                              <div className="flex items-center">
                                <span className="text-gray-500">Tuổi:</span>
                                <span className="ml-1 font-medium">
                                  {pet.age} tháng
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 font-bold text-[#00171F] font-[900]">
                              {formatPrice(pet.price)} VND
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="flex items-center space-x-1">
                        <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="text-xs"
                          />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                          )
                          .map((page) => (
                            <React.Fragment key={page}>
                              {page > 1 &&
                                page === currentPage - 1 &&
                                currentPage > 3 && (
                                  <span className="px-2 py-1">...</span>
                                )}

                              <button
                                onClick={() => {
                                  setCurrentPage(page);
                                  
                                  // Cuộn lên đầu trang
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  
                                  // Cập nhật URL nếu cần
                                  if (filters.species) {
                                    const newUrl = `/pets?species=${encodeURIComponent(filters.species)}&page=${page}`;
                                    router.push(newUrl, undefined, { shallow: true });
                                  } else {
                                    router.push(`/pets?page=${page}`, undefined, { shallow: true });
                                  }
                                  
                                  // Fetch data with the new page
                                  fetchPets(filters, page);
                                }}
                                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                  currentPage === page
                                    ? "bg-[#003459] text-white"
                                    : "text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {page}
                              </button>

                              {page < totalPages &&
                                page === currentPage + 1 &&
                                currentPage < totalPages - 2 && (
                                  <span className="px-2 py-1">...</span>
                                )}
                            </React.Fragment>
                          ))}

                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-xs"
                          />
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PetsPage;