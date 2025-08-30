const Message = ({ role, content }) => {
    const isUser = role === "user";
  
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`px-4 py-3 max-w-xl rounded-2xl shadow ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none"
          }`}
        >
          <p className="whitespace-pre-line">{content}</p>
        </div>
      </div>
    );
  };
  
  export default Message;
  