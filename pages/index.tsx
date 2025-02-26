import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle file input change
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setFile(file);
  };

  // Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Post the file to the Flask API and get the processed file response as a Blob
      const response = await axios.post("http://localhost:8080/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // Expect a blob (file) as the response
      });

      // Create a URL for the blob and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "processed_file.csv"); // You can set a dynamic filename here if needed
      document.body.appendChild(link);
      link.click();

      // Clean up and revoke the blob URL
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage("File uploaded and processed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg border border-gray-300">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Upload CSV File</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label htmlFor="file" className="text-lg font-medium text-gray-700 mb-2">Select CSV File:</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload File"}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center">
            <p
              className={`text-sm font-medium ${message.includes("Error") ? "text-red-500" : "text-green-500"
                }`}
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
