import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPaperPlane, faStar, faCheck, faReply, faShield } from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../components/layouts/AdminLayout';
import { getUnreadComments, markCommentAsRead, addCommentReply, getCommentsByPetId } from '../../utils/api';

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

const AdminComments = () => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [unreadComments, setUnreadComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    // If not logged in or not an admin, redirect to login
    if (!token || role !== 'admin') {
      router.push('/login?redirect=/admin/comments');
    } else {
      // Fetch comments
      fetchUnreadComments();
    }
  }, [router]);

  // Fetch unread comments
  const fetchUnreadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getUnreadComments();
      setUnreadComments(data);
    } catch (err) {
      console.error('Error fetching unread comments:', err);
      setError('Không thể tải bình luận chưa đọc. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark comment as read
  const handleMarkAsRead = async (commentId: string) => {
    try {
      await markCommentAsRead(commentId);
      
      // Update local state
      setUnreadComments(prevComments => 
        prevComments.filter(comment => comment._id !== commentId)
      );
    } catch (err) {
      console.error('Error marking comment as read:', err);
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
    if (!replyContent.trim()) {
      return;
    }

    setIsSubmittingReply(true);

    try {
      const updatedComment = await addCommentReply(commentId, replyContent);
      
      // Update the comment in the state
      setUnreadComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId ? updatedComment : comment
        )
      );
      
      // Reset reply state
      setReplyingTo(null);
      setReplyContent('');
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setIsSubmittingReply(false);
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

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get comments to display based on active tab
  const displayComments = activeTab === 'unread' ? unreadComments : comments;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#003459]">Quản lý bình luận</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'unread' 
                  ? 'bg-[#003459] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Chưa đọc ({unreadComments.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'all' 
                  ? 'bg-[#003459] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003459]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : displayComments.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <FontAwesomeIcon icon={faComment} className="text-5xl text-gray-400 mb-3" />
            <p className="text-gray-600">
              {activeTab === 'unread' 
                ? 'Không có bình luận nào chưa đọc.'
                : 'Không có bình luận nào.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayComments.map((comment) => (
              <div 
                key={comment._id} 
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mr-2">
                        {comment.name.charAt(0).toUpperCase()}
                      </span>
                      <h3 className="font-bold text-lg text-[#003459]">{comment.name}</h3>
                      {!comment.isRead && (
                        <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                          Mới
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDetailedTime(comment.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!comment.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(comment._id)}
                        className="text-green-600 hover:text-green-800 flex items-center text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button
                      onClick={() => handleStartReply(comment._id)}
                      className="text-[#003459] hover:text-[#00293F] flex items-center text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <FontAwesomeIcon icon={faReply} className="mr-1" />
                      Phản hồi
                    </button>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon 
                      key={star} 
                      icon={faStar} 
                      className={star <= comment.rating ? "text-amber-400" : "text-gray-300"} 
                    />
                  ))}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  {comment.content}
                </div>
                
                {/* Admin Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 border-l-2 border-amber-300 pl-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Phản hồi:</h4>
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
                
                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-medium text-[#003459] mb-2 flex items-center">
                      <FontAwesomeIcon icon={faReply} className="mr-2" />
                      Phản hồi bình luận này
                    </h4>
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComments; 