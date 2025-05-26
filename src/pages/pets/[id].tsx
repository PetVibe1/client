import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { getPetById, getCommentsByPetId, addComment, addCommentReply, getSimilarPets } from '../../utils/api';
import MainLayout from '../../components/layouts/MainLayout';
import PetItem from '../../components/pets/PetItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPhone, faShare, faArrowRight, faPaperPlane, faStar, faLock, faUser, faReply, faShield, faCheck, faFlag } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

// Reply interface
interface Reply {
  _id: string;
  adminId: string;
  adminName: string;
  content: string;
  createdAt: string;
}

// Comment interface
interface Comment {
  _id: string;
  petId: string;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
  userId?: string;
  replies?: Reply[];
  isRead?: boolean;
}

// Định nghĩa kiểu dữ liệu cho pet
interface Pet {
  _id: string;
  code: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  color: string;
  price: number;
  description?: string;
  image?: {
    url: string;
    public_id: string;
  };
  additionalImages?: {
    url: string;
    public_id: string;
  }[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

const PetDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const testimonialContainerRef = useRef<HTMLDivElement>(null);
  
  // CSS styles for customers section
  const customStyles = `
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    
    @keyframes pulse-light {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    
    .animate-pulse-light {
      animation: pulse-light 2s ease-in-out infinite;
    }
    
    @keyframes testimonial-fade {
      0% { opacity: 0.7; transform: translateX(20px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    
    .testimonial-slide {
      animation: testimonial-fade 0.5s ease forwards;
    }
    
    .active-testimonial-image {
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
    }
    
    .active-testimonial-image img {
      filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2)) contrast(1.05);
    }
  `;
  
  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [newCommentNotification, setNewCommentNotification] = useState<string | null>(null);
  
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  // New animation state
  const [isNewComment, setIsNewComment] = useState<string | null>(null);
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Mảng hình ảnh khách hàng giả lập
  const testimonials = [
    { 
      id: 1, 
      image: "/images/testimonials/image 22 (1).png",
      name: "Nguyễn Văn An",
      country: "VN"
    },
    { 
      id: 2, 
      image: "/images/testimonials/image 22 (2).png",
      name: "Trần Minh Hiếu",
      country: "VN" 
    },
    { 
      id: 3, 
      image: "/images/testimonials/image 22 (3).png",
      name: "Phạm Thị Hoa",
      country: "VN"
    },
    { 
      id: 4, 
      image: "/images/testimonials/image 22.png",
      name: "David Smith",
      country: "US"
    },
    { 
      id: 5, 
      image: "/images/testimonials/testimonial-5.jpg",
      name: "Tanaka Yuki",
      country: "JP"
    },
  ];

  // Check authentication status
  useEffect(() => {
    // Check for user token in localStorage
    const token = localStorage.getItem('userToken');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    
    if (token) {
      setIsLoggedIn(true);
      if (name) {
        setUserName(name);
        setCommentName(name); // Pre-fill the comment name field
      }
      
      // Check if user is admin
      if (role === 'admin') {
        console.log('User is admin, enabling admin features');
        setIsAdmin(true);
      }
    }
  }, []);

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Fetch pet data and comments with polling
  useEffect(() => {
    if (!id) return;

    const fetchPetData = async () => {
      setIsLoading(true);
      try {
        const data = await getPetById(id as string);
        setPet(data);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError('Không thể tải thông tin thú cưng. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const data = await getCommentsByPetId(id as string);
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setCommentError('Không thể tải bình luận. Vui lòng thử lại sau.');
      }
    };

    fetchPetData();
    fetchComments();
    
    // Set up polling for comments
    const intervalId = setInterval(() => {
      fetchComments();
    }, 10000); // Poll every 10 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [id]);

  // Format giá tiền với dấu chấm ngăn cách hàng nghìn
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Xử lý khi click vào thumbnail
  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
  };

  // Xử lý khi click vào nút chuyển testimonial
  const handleTestimonialDotClick = (index: number) => {
    setActiveTestimonialIndex(index);
    
    // Scroll to the active testimonial smoothly
    if (testimonialContainerRef.current) {
      const container = testimonialContainerRef.current;
      const itemWidth = 320 + 32; // width(80) + padding/gap(8*4)
      const scrollPosition = index * itemWidth;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Xử lý khi click vào nút chat
  const handleChatClick = () => {
    // Thực hiện hành động khi click vào nút chat
    console.log('Chat với Monitö');
  };

  // Xử lý khi click vào nút liên hệ
  const handleContactClick = () => {
    // Thực hiện hành động khi click vào nút liên hệ
    console.log('Liên hệ');
  };

  // Tạo mảng hình ảnh từ pet để hiển thị trong gallery
  const getGalleryImages = () => {
    if (!pet) return [];

    // Hình ảnh chính
    const mainImage = pet.image?.url || '/images/pet-placeholder.jpg';
    
    // Hình ảnh bổ sung (nếu có)
    const additionalImages = pet.additionalImages?.map(img => img.url) || [];
    
    // Tạo một số hình ảnh giả lập nếu không có đủ
    const dummyImages = [
      '/images/pets/shiba-1.jpg',
      '/images/pets/shiba-2.jpg',
      '/images/pets/shiba-3.jpg',
      '/images/pets/shiba-4.jpg',
      '/images/pets/shiba-5.jpg',
    ];
    
    // Kết hợp tất cả hình ảnh
    const allImages = [mainImage, ...additionalImages];
    
    // Nếu có ít hơn 6 ảnh, thêm ảnh giả lập
    if (allImages.length < 6) {
      return [...allImages, ...dummyImages].slice(0, 6);
    }
    
    return allImages;
  };

  // Format date for comments with more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Format relative time (e.g. "2 giờ trước")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} ngày trước`;
    } else if (diffHour > 0) {
      return `${diffHour} giờ trước`;
    } else if (diffMin > 0) {
      return `${diffMin} phút trước`;
    } else {
      return `Vừa xong`;
    }
  };

  // Format detailed time for comments
  const formatDetailedTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  // Redirect to login
  const handleLoginRedirect = () => {
    // Save the current URL to redirect back after login
    localStorage.setItem('loginRedirect', window.location.pathname);
    router.push('/login');
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setCommentError('Vui lòng đăng nhập để bình luận');
      return;
    }
    
    if (!commentName.trim() || !commentContent.trim()) {
      setCommentError('Vui lòng điền đầy đủ tên và nội dung bình luận');
      return;
    }
    
    setIsSubmitting(true);
    setCommentError(null);
    
    try {
      const newComment = await addComment(id as string, {
        name: commentName,
        content: commentContent,
        rating: commentRating
      });
      
      // Add new comment to the list
      setComments(prevComments => [newComment, ...prevComments]);
      
      // Mark this comment as new for animation
      setIsNewComment(newComment._id);
      setTimeout(() => setIsNewComment(null), 5000);
      
      // Show notification
      setNewCommentNotification('Bình luận của bạn đã được thêm thành công!');
      setTimeout(() => {
        setNewCommentNotification(null);
      }, 3000);
      
      // Reset form
      setCommentContent('');
      setCommentRating(5);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setCommentError('Không thể gửi bình luận. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start replying to a comment
  const handleStartReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  // Cancel replying
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  // Submit admin reply
  const handleSubmitReply = async (commentId: string) => {
    if (!isAdmin) {
      return;
    }

    if (!replyContent.trim()) {
      return;
    }

    setIsSubmittingReply(true);

    try {
      const updatedComment = await addCommentReply(commentId, replyContent);
      
      // Update the comment in the state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId ? updatedComment : comment
        )
      );
      
      // Reset reply state
      setReplyingTo(null);
      setReplyContent('');
      
      // Show notification
      setNewCommentNotification('Phản hồi của bạn đã được thêm thành công!');
      setTimeout(() => {
        setNewCommentNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting reply:', err);
      setCommentError('Không thể gửi phản hồi. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !pet) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'Không tìm thấy thú cưng'}
          </div>
          <Link 
            href="/pets"
            className="inline-flex items-center px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Quay lại danh sách thú cưng
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Lấy hình ảnh cho gallery
  const galleryImages = getGalleryImages();

  return (
    <MainLayout>
      <Head>
        <title>{pet.name} - Thú cưng | Monitö</title>
        <meta
          name="description"
          content={`Chi tiết về ${pet.name} tại cửa hàng thú cưng Monitö`}
        />
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      </Head>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#003459]">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link href="/pets" className="hover:text-[#003459]">
              {pet.species}
            </Link>
            {pet.breed && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/pets?species=${encodeURIComponent(
                    pet.species
                  )}&breed=${encodeURIComponent(pet.breed)}`}
                  className="hover:text-[#003459]"
                >
                  {pet.breed}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-[#003459] font-medium">{pet.name}</span>
          </div>

          {/* Pet Detail Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Images */}
            <div>
              {/* Main Image */}
              <div className="rounded-lg overflow-hidden mb-4 relative h-[400px]">
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-6 gap-2">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all
                      ${
                        activeImageIndex === index
                          ? "border-[#003459]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <img
                      src={image}
                      alt={`${pet.name} thumbnail ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Info */}
            <div>
              <h1 className="text-3xl font-bold text-[#003459] mb-2">
                {pet.name}
              </h1>
              <p className="text-2xl font-bold text-gray-800 mb-6">
                {formatPrice(pet.price)} VND
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={handleContactClick}
                  className="px-6 py-3 bg-[#003459] text-white rounded-full font-medium hover:bg-[#00293F] transition-colors"
                >
                  Liên hệ
                </button>
                <button
                  onClick={handleChatClick}
                  className="px-6 py-3 bg-white border-2 border-[#003459] text-[#003459] rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FontAwesomeIcon icon={faComment} className="mr-2" />
                  Chat với Monitö
                </button>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border-b border-gray-200 py-2">
                  <span className="text-[#003459] font-[900]">SKU</span>
                  <p className="font-medium text-[#667479]">
                    #{pet.code || "1000078"}
                  </p>
                </div>
                <div className="border-b border-gray-200 py-2">
                  <span className="text-[#003459] font-[900]">Giống</span>
                  <p className="font-medium text-[#667479]">{pet.gender}</p>
                </div>
                <div className="border-b border-gray-200 py-2">
                  <span className="text-[#003459] font-[900]">Tuổi</span>
                  <p className="font-medium text-[#667479]">{pet.age} tháng</p>
                </div>
                <div className="border-b border-gray-200 py-2">
                  <span className="text-[#003459] font-[900]">Kích thước</span>
                  <p className="font-medium text-[#667479]">
                    {pet.size || "Nhỏ"}
                  </p>
                </div>
                <div className="border-b border-gray-200 py-2">
                  <span className="text-[#003459] font-[900] text-600">
                    Màu sắc
                  </span>
                  <div className="flex items-center">
                    <span
                      className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-300"
                      style={{
                        backgroundColor:
                          pet.color === "Vàng"
                            ? "#F59E0B"
                            : pet.color === "Đen"
                            ? "#111827"
                            : pet.color === "Trắng"
                            ? "#F9FAFB"
                            : pet.color === "Nâu"
                            ? "#92400E"
                            : pet.color === "Xám"
                            ? "#6B7280"
                            : "#E5E7EB",
                      }}
                    ></span>
                    <p className="font-medium text-[#667479] ">
                      {pet.color || "Không xác định"}
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-200 py-2">
                  <span className="text-[#003459] font-[900]">Mô tả ngắn</span>
                  <p className="font-medium line-clamp-2 text-[#667479]">
                    {pet.description ||
                      "Không có mô tả chi tiết cho thú cưng này."}
                  </p>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Chia sẻ:</span>
                <div className="flex gap-2">
                  <a href="#" className="text-gray-600 hover:text-[#003459]">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#003459]">
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#003459]">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#003459]">
                    <FontAwesomeIcon icon={faYoutube} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Testimonials */}
          <div className="mb-16 bg-gradient-to-r from-blue-50 to-white rounded-2xl p-8 pb-16 shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-bold text-[#003459] mb-8 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Khách hàng của chúng tôi
            </h2>

            <div className="relative overflow-visible py-4" style={{ background: "radial-gradient(circle at 100% 100%, rgba(3,52,89,0.03), transparent 400px)" }}>
              {/* Testimonial Slides */}
              <div ref={testimonialContainerRef} className="flex gap-8 overflow-x-auto pb-12 hide-scrollbar px-2">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className={`flex-none w-80 h-80 transition-all duration-300 transform ${
                      activeTestimonialIndex === index 
                        ? 'scale-[1.03] testimonial-slide z-10 active-testimonial-image' 
                        : 'scale-100 opacity-90'
                    }`}
                  >
                    <div className={`relative h-full group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all ${
                      activeTestimonialIndex === index
                        ? 'border-2 border-amber-400 shadow-amber-100'
                        : 'border border-gray-100'
                    }`}>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500 rounded-br-lg"></div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-9 h-9 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mr-2 border border-amber-200 shadow-sm">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#003459] line-clamp-1">{testimonial.name}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              {testimonial.country === "VN" && (
                                <span className="flex items-center">
                                  <span className="inline-block w-4 h-3 bg-red-600 mr-1 relative">
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-yellow-300 text-[8px]">★</span>
                                    </span>
                                  </span>
                                  Việt Nam
                                </span>
                              )}
                              {testimonial.country === "US" && (
                                <span className="flex items-center">
                                  <span className="inline-block w-4 h-3 bg-blue-600 mr-1 relative overflow-hidden">
                                    <span className="absolute top-0 left-0 w-2 h-2 bg-blue-600">
                                      <span className="absolute inset-0 text-white text-[6px] flex items-center justify-center">★</span>
                                    </span>
                                  </span>
                                  United States
                                </span>
                              )}
                              {testimonial.country === "JP" && (
                                <span className="flex items-center">
                                  <span className="inline-block w-4 h-3 bg-white mr-1 border border-gray-200 relative">
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                    </span>
                                  </span>
                                  Japan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                          {index + 1}/5
                        </div>
                      </div>
                      <div className="h-[75%] flex items-center justify-center overflow-hidden rounded-lg bg-white p-3 relative mt-1">
                        {/* Decorative border */}
                        <div className="absolute inset-0 rounded-lg" style={{ 
                          background: 'linear-gradient(145deg, rgba(251,191,36,0.3) 0%, rgba(217,119,6,0.1) 100%)',
                          padding: '1px'
                        }}>
                          <div className="absolute inset-0 bg-white rounded-lg"></div>
                        </div>
                        
                        {/* Image container */}
                        <div className={`relative z-10 w-full h-full rounded-md overflow-hidden border ${
                          activeTestimonialIndex === index
                            ? 'border-amber-200 active-testimonial-image'
                            : 'border-amber-100'
                        } shadow-inner bg-gray-50 flex items-center justify-center p-1`}
                            style={{
                              boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
                            }}>
                          <img
                            src={testimonial.image}
                            alt={`Khách hàng ${testimonial.name}`}
                            className="max-h-full max-w-full object-contain rounded-sm transition-all"
                            style={{ 
                              aspectRatio: 'auto',
                              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
                            }}
                          />
                        </div>
                        
                        {/* Corner decorations */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-500 rounded-full"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-500 rounded-full"></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end">
                        <div className="p-4 text-white w-full bg-black/40 rounded-b-xl">
                          <p className="font-medium">{testimonial.name}</p>
                          <div className="flex items-center text-sm opacity-90">
                            <span className="mr-2">Hạnh phúc với thú cưng từ Monitö</span>
                            {testimonial.country === "VN" && (
                              <span className="inline-block w-4 h-3 bg-red-600 relative">
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-yellow-300 text-[8px]">★</span>
                                </span>
                              </span>
                            )}
                            {testimonial.country === "US" && (
                              <span className="inline-block w-4 h-3 bg-blue-600 relative overflow-hidden">
                                <span className="absolute top-0 left-0 w-2 h-2 bg-blue-600">
                                  <span className="absolute inset-0 text-white text-[6px] flex items-center justify-center">★</span>
                                </span>
                              </span>
                            )}
                            {testimonial.country === "JP" && (
                              <span className="inline-block w-4 h-3 bg-white border border-gray-200 relative">
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation arrows - Positioned at bottom right */}
              <div className="absolute -bottom-6 right-8 flex space-x-4 z-30">
                <button 
                  className="bg-[#8DD8FF] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-[#7AC6EE]"
                  onClick={() => handleTestimonialDotClick(activeTestimonialIndex === 0 ? testimonials.length - 1 : activeTestimonialIndex - 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button 
                  className="bg-[#8DD8FF] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-[#7AC6EE]"
                  onClick={() => handleTestimonialDotClick((activeTestimonialIndex + 1) % testimonials.length)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Indicator Dots */}
              <div className="absolute -bottom-14 left-0 right-0 flex justify-center gap-3 z-10">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeTestimonialIndex === index
                        ? "bg-[#003459] w-6"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => handleTestimonialDotClick(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mb-16 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-[#003459] mb-8 flex items-center">
              <FontAwesomeIcon icon={faComment} className="mr-3 text-amber-500" />
              Bình luận và đánh giá
            </h2>

            {/* New Comment Notification */}
            {newCommentNotification && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex justify-between items-center border border-green-200 shadow-sm animate-fade-in">
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faComment} className="mr-2" />
                  {newCommentNotification}
                </span>
                <button 
                  onClick={() => setNewCommentNotification(null)}
                  className="text-green-800 hover:text-green-900 focus:outline-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Comment Form */}
            <div className="bg-[#FCFCFD] p-6 rounded-xl mb-10 border border-gray-100 shadow-sm transition-all">
              <h3 className="text-xl font-bold text-[#003459] mb-6 pb-3 border-b border-gray-200 flex items-center">
                <FontAwesomeIcon icon={faPaperPlane} className="mr-2 text-amber-500" />
                Để lại bình luận
              </h3>
              
              {commentError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 animate-fade-in">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    {commentError}
                  </div>
                </div>
              )}
              
              {!isLoggedIn ? (
                <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-100 shadow-inner">
                  <div className="flex justify-center mb-4 text-[#003459]">
                    <FontAwesomeIcon icon={faLock} className="text-3xl" />
                  </div>
                  <p className="text-gray-700 mb-5">Vui lòng đăng nhập để bình luận</p>
                  <button
                    onClick={handleLoginRedirect}
                    className="px-8 py-3 bg-[#003459] text-white rounded-full font-medium hover:bg-[#00293F] transition-colors shadow-sm flex items-center mx-auto hover:scale-105 transform transition"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Đăng nhập ngay
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCommentSubmit} className="transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên của bạn <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003459] focus:border-[#003459] bg-white text-gray-800 font-medium shadow-sm"
                          placeholder="Nhập tên của bạn"
                          required
                          readOnly={!!userName}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                        Đánh giá của bạn
                      </label>
                      <div className="flex items-center bg-white p-3 border border-gray-300 rounded-lg">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCommentRating(star)}
                            className="text-2xl focus:outline-none mx-1 hover:scale-110 transition-transform"
                          >
                            <FontAwesomeIcon 
                              icon={faStar} 
                              className={star <= commentRating ? "text-amber-400" : "text-gray-300"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung bình luận <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-gray-400">
                        <FontAwesomeIcon icon={faComment} />
                      </div>
                      <textarea
                        id="content"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        rows={4}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003459] focus:border-[#003459] bg-white text-gray-800 shadow-sm"
                        placeholder="Chia sẻ cảm nghĩ của bạn về thú cưng này..."
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-[#003459] text-white rounded-full font-medium hover:bg-[#00293F] transition-all shadow-sm flex items-center ml-auto hover:scale-105 transform"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang gửi...
                        </span>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                          Gửi bình luận
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Comments List */}
            <div>
              <h3 className="text-xl font-bold text-[#003459] mb-6 pb-3 border-b border-gray-200 flex items-center">
                <span className="bg-[#003459] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm mr-3">
                  {comments.length}
                </span> 
                Bình luận
              </h3>
              
              {comments.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-100">
                  <div className="text-gray-400 text-5xl mb-3">
                    <FontAwesomeIcon icon={faComment} />
                  </div>
                  <p className="text-gray-600">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div 
                      key={comment._id} 
                      className={`bg-[#FCFCFD] p-6 rounded-xl border ${isNewComment === comment._id ? 'border-amber-300' : 'border-gray-100'} shadow-sm hover:shadow-md transition-all ${isNewComment === comment._id ? 'animate-pulse-light' : ''}`}
                    >
                      {/* User Comment */}
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-[#003459] text-lg flex items-center">
                          <span className="w-8 h-8 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mr-2">
                            {comment.name.charAt(0).toUpperCase()}
                          </span>
                          {comment.name}
                        </h4>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDetailedTime(comment.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex mb-4 bg-amber-50 inline-block px-3 py-1 rounded-full">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesomeIcon 
                            key={star} 
                            icon={faStar} 
                            className={star <= comment.rating ? "text-amber-400" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                      
                      <p className="text-gray-700 bg-white p-4 rounded-lg border border-gray-100">{comment.content}</p>
                      
                      {/* Admin Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 ml-6 border-l-2 border-amber-300 pl-4">
                          <h5 className="text-sm font-semibold text-gray-500 mb-2">Phản hồi từ nhân viên:</h5>
                          {comment.replies.map((reply, index) => (
                            <div key={index} className="bg-blue-50 p-4 rounded-lg mb-2 border border-blue-100">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-[#003459] flex items-center">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-2">
                                    <FontAwesomeIcon icon={faShield} className="text-xs" />
                                  </span>
                                  <span className="flex items-center">
                                    {reply.adminName}
                                    <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                      Admin
                                    </span>
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDetailedTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Kiểm tra rõ ràng nếu người dùng là admin và hiển thị nút phản hồi */}
                      {localStorage.getItem('userRole') === 'admin' && (
                        <div className="mt-4 flex justify-end">
                          {replyingTo === comment._id ? (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 w-full">
                              <h5 className="text-sm font-medium text-[#003459] mb-2 flex items-center">
                                <FontAwesomeIcon icon={faReply} className="mr-2" />
                                Phản hồi bình luận này
                              </h5>
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003459] focus:border-[#003459] bg-white text-gray-800 shadow-sm mb-3"
                                placeholder="Nhập nội dung phản hồi của bạn..."
                                rows={3}
                              ></textarea>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleCancelReply}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleSubmitReply(comment._id)}
                                  disabled={isSubmittingReply}
                                  className="px-4 py-2 bg-[#003459] text-white rounded-lg hover:bg-[#00293F] transition-colors flex items-center"
                                >
                                  {isSubmittingReply ? (
                                    <span className="flex items-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Đang gửi...
                                    </span>
                                  ) : (
                                    <>
                                      <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                      Gửi phản hồi
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartReply(comment._id)}
                              className="mt-2 flex items-center text-sm font-medium text-white bg-[#003459] px-4 py-2 rounded-lg border border-[#003459] hover:bg-[#00293F] transition-colors shadow-sm"
                            >
                              <FontAwesomeIcon icon={faReply} className="mr-2" />
                              Phản hồi với tư cách Admin
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Pets */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Thú cưng tương tự
              </h2>
              <Link
                href={`/pets?species=${pet?.species ? encodeURIComponent(pet.species) : ''}`}
                className="text-[#003459] font-medium hover:underline flex items-center"
              >
                Xem tất cả{" "}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            </div>

            {/* Fetch and display similar pets */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
                <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
                <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
                <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
              </div>
            ) : (
              <SimilarPetsContent petId={pet?._id} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Similar Pets Component (embedded to leverage existing pet state)
const SimilarPetsContent = ({ petId }: { petId?: string }) => {
  const [similarPets, setSimilarPets] = useState<Pet[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);
  const [errorSimilar, setErrorSimilar] = useState<string | null>(null);

  useEffect(() => {
    const loadSimilarPets = async () => {
      if (!petId) return;
      
      setIsLoadingSimilar(true);
      try {
        const fetchedPets = await getSimilarPets(petId, 4);
        setSimilarPets(fetchedPets);
        console.log(`Loaded ${fetchedPets.length} similar pets`);
      } catch (err) {
        console.error('Error loading similar pets:', err);
        setErrorSimilar('Không thể tải dữ liệu thú cưng tương tự.');
        setSimilarPets([]);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    loadSimilarPets();
  }, [petId]);

  if (isLoadingSimilar) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
        <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
        <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
        <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
      </div>
    );
  }

  if (errorSimilar) {
    return <div className="text-red-500 text-center py-4">{errorSimilar}</div>;
  }

  if (similarPets.length === 0) {
    return <div className="text-gray-500 text-center py-4">Không tìm thấy thú cưng tương tự.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {similarPets.map((pet) => (
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
  );
};

export default PetDetail; 