const MessagesPage = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-darkblue/50 to-bluish-gray/30 backdrop-blur-sm">
      <div className="text-center p-8">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
          <svg
            className="w-12 h-12 text-light-bluish-gray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-white text-xl font-semibold mb-2">
          Select a conversation
        </h3>
        <p className="text-light-bluish-gray text-sm max-w-md">
          Choose a chat from the sidebar to start messaging or start a new
          conversation
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;
