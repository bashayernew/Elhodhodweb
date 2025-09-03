import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/api';

const MessagesPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);

  // Load conversation threads from API
  useEffect(() => {
    let cancelled = false;
    apiFetch('/messages')
      .then((res) => {
        if (cancelled) return;
        const threads = (res.data || []).map((t) => ({
          id: t.otherUser?.id,
          name: `${t.otherUser?.profile?.firstName || 'User'}`,
          avatar: (t.otherUser?.profile?.firstName || 'U').slice(0, 2).toUpperCase(),
          lastMessage: t.lastMessage?.content || '',
          timestamp: new Date(t.lastMessage?.createdAt || Date.now()).toLocaleString(),
          unread: (t.unreadCount || 0) > 0,
          online: false
        }));
        setConversations(threads);
        // If a ?to=providerId is provided, preselect/open that chat
        const toId = searchParams.get('to');
        if (toId) {
          const existing = threads.find((t) => String(t.id) === String(toId));
          if (existing) setSelectedChat(existing);
          else setSelectedChat({ id: toId, name: 'Professional', avatar: 'PR' });
        }
      })
      .catch(() => {
        setConversations([]);
      });
    return () => { cancelled = true; };
  }, []);

  // Load messages for selected thread
  useEffect(() => {
    if (!selectedChat?.id) { setThreadMessages([]); return; }
    let cancelled = false;
    apiFetch(`/messages/${selectedChat.id}`)
      .then((res) => {
        if (cancelled) return;
        const msgs = (res.data || []).map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString(),
          isOwn: m.senderId === (JSON.parse(localStorage.getItem('hodhod_user') || '{}').id)
        }));
        setThreadMessages(msgs);
      })
      .catch(() => setThreadMessages([]));
    return () => { cancelled = true; };
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat?.id) return;
    try {
      await apiFetch('/messages', { method: 'POST', body: { receiverId: selectedChat.id, content: message } });
      setMessage('');
      // reload thread
      const res = await apiFetch(`/messages/${selectedChat.id}`);
      const msgs = (res.data || []).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString(),
        isOwn: m.senderId === (JSON.parse(localStorage.getItem('hodhod_user') || '{}').id)
      }));
      setThreadMessages(msgs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('messages.title')}
          </h1>
          <p className="text-gray-600">
            {t('messages.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('messages.conversations')}
                </h2>
                <input
                  type="text"
                  placeholder={t('messages.searchConversations')}
                  className="w-full input-field-sm"
                />
              </div>
              
              <div className="overflow-y-auto h-full">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className={`p-4 cursor-pointer border-b border-gray-100 ${
                      selectedChat?.id === conversation.id ? 'bg-gold-50 border-gold-200' : ''
                    }`}
                    onClick={() => setSelectedChat(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center">
                          <span className="text-gold-600 font-medium">{conversation.avatar}</span>
                        </div>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{conversation.name}</h3>
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread && (
                        <div className="w-3 h-3 bg-gold-500 rounded-full"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                            <span className="text-gold-600 font-medium">{selectedChat.avatar}</span>
                          </div>
                          {selectedChat.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedChat.online ? t('messages.online') : t('messages.offline')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <PhoneIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <VideoCameraIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {threadMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isOwn 
                            ? 'bg-gold-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.isOwn ? 'text-gold-100' : 'text-gray-500'
                          }`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={t('messages.typeMessage')}
                          className="w-full input-field resize-none"
                          rows="2"
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('messages.selectConversation')}
                    </h3>
                    <p className="text-gray-600">
                      {t('messages.selectConversationDesc')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
