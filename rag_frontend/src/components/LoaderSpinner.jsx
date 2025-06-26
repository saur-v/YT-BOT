export default function LoaderSpinner() {
  return (
    <div className="text-center mt-4">
      <div className="inline-block w-6 h-6 border-4 border-green-600 border-dashed rounded-full animate-spin"></div>
      <p className="text-sm text-gray-600 mt-2">Processing...</p>
    </div>
  );
}
