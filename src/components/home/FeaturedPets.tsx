import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PetItem from '../pets/PetItem';
import { getFeaturedPets } from '../../services/petService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface FeaturedPetsProps {
  title?: string;
  subtitle?: string;
}

interface Pet {
  _id: string;
  code: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  price: number;
  image?: {
    url: string;
    public_id: string;
  };
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

const FeaturedPets: React.FC<FeaturedPetsProps> = ({ 
  title = "Một Số Vật Nuôi Của Chúng Tôi", 
  subtitle = "Có gì mới?" 
}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const petsPerPage = 8;

  useEffect(() => {
    const loadPets = async () => {
      setIsLoading(true);
      try {
        // Tải tất cả thú cưng để tính toán tổng số trang
        const fetchedPets = await getFeaturedPets(50); // Lấy số lượng đủ lớn để có tất cả thú cưng
        console.log(`Loaded ${fetchedPets.length} pets for homepage`);
        
        // Tính toán tổng số trang
        const total = fetchedPets.length;
        const pages = Math.max(1, Math.ceil(total / petsPerPage));
        setTotalPages(pages);
        setPets(fetchedPets);
        
        // Log thông tin về danh sách thú cưng
        if (fetchedPets.length > 0) {
          console.log('Pets sorted by creation date:');
          fetchedPets.forEach((pet, index) => {
            console.log(`${index + 1}. ${pet.name} - ${pet.code} - Created: ${new Date(pet.createdAt).toLocaleString()}`);
          });
          console.log('First pet:', fetchedPets[0].name, '- Created:', new Date(fetchedPets[0].createdAt).toLocaleString());
          console.log('Last pet:', fetchedPets[fetchedPets.length - 1].name, '- Created:', new Date(fetchedPets[fetchedPets.length - 1].createdAt).toLocaleString());
        }
      } catch (err) {
        console.error('Error loading pets:', err);
        setError('Không thể tải dữ liệu thú cưng.');
        setPets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
    
    // Tự động làm mới dữ liệu mỗi 30 giây để cập nhật thú cưng mới
    const refreshInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [refreshTrigger]);

  // Khi currentPage thay đổi, cuộn lên đầu phần danh sách thú cưng
  useEffect(() => {
    // Chỉ áp dụng khi không phải lần render đầu tiên
    if (pets.length > 0) {
      setTimeout(() => {
        const featuredSection = document.getElementById('featured-pets-section');
        if (featuredSection) {
          const yOffset = -80; // Tạo khoảng cách đủ để thấy tiêu đề
          const y = featuredSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [currentPage, pets]);

  // Xử lý chuyển trang
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      
      // Cuộn lên đầu phần Featured Pets
      setTimeout(() => {
        const featuredSection = document.getElementById('featured-pets-section');
        if (featuredSection) {
          const yOffset = -80; // Tạo khoảng cách đủ để thấy tiêu đề
          const y = featuredSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          // Fallback nếu không tìm thấy element
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100); // Thêm độ trễ nhỏ để đảm bảo DOM đã được cập nhật
      
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      
      // Cuộn lên đầu phần Featured Pets
      setTimeout(() => {
        const featuredSection = document.getElementById('featured-pets-section');
        if (featuredSection) {
          const yOffset = -80; // Tạo khoảng cách đủ để thấy tiêu đề
          const y = featuredSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          // Fallback nếu không tìm thấy element
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100); // Thêm độ trễ nhỏ để đảm bảo DOM đã được cập nhật
      
      setCurrentPage(newPage);
    }
  };

  // Tính toán thú cưng hiển thị trên trang hiện tại
  const getCurrentPagePets = () => {
    const startIndex = (currentPage - 1) * petsPerPage;
    const endIndex = startIndex + petsPerPage;
    return pets.slice(startIndex, endIndex);
  };

  // Thú cưng hiển thị trên trang hiện tại
  const currentPagePets = getCurrentPagePets();

  if (error) {
    console.error("Error fetching pets:", error);
  }

  return (
    <section id="featured-pets-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">{subtitle}</p>
            <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
          </div>
          <Link 
            href="/pets"
            className="inline-flex items-center px-6 py-3 rounded-full border-2 border-slate-800 text-slate-800 font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            Xem thêm <span className="ml-2">&#8594;</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentPagePets.map((pet) => (
                <PetItem
                  key={pet._id}
                  id={pet._id}
                  code={pet.code}
                  name={pet.name}
                  gender={pet.gender}
                  age={pet.age}
                  price={pet.price}
                  imageUrl={pet.image?.url || '/images/pet-placeholder.jpg'}
                />
              ))}
            </div>

            {/* Phân trang */}
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
                            // Cuộn lên đầu phần Featured Pets
                            setTimeout(() => {
                              const featuredSection = document.getElementById('featured-pets-section');
                              if (featuredSection) {
                                const yOffset = -80; // Tạo khoảng cách đủ để thấy tiêu đề
                                const y = featuredSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              } else {
                                // Fallback nếu không tìm thấy element
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }, 100); // Thêm độ trễ nhỏ
                            
                            setCurrentPage(page);
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
    </section>
  );
};

export default FeaturedPets; 