export default function Loader({className = ""}) {
    return (
      <div className={`flex gap-4 justify-center mt-10 ${className}`}>
        <div className="w-3 h-3 px-1 animate-ping rounded-full bg-gray-700" />
        <div className="w-3 h-3 px-1 animate-ping rounded-full bg-gray-700" />
        <div className="w-3 h-3 px-1 animate-ping rounded-full bg-gray-700" />
      </div>
    );
  }