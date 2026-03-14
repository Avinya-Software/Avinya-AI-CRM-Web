import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const QuickBooksSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
            <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md">
                <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />

                <h1 className="text-2xl font-bold mb-2">
                    QuickBooks Connected
                </h1>

                <p className="text-slate-500 mb-6">
                    Your account has been successfully connected.
                </p>

                <button
                    onClick={() => navigate("/quickbook-customers")}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition"
                >
                    Go to QuickBook Customer
                </button>
            </div>
        </div>
    );
};

export default QuickBooksSuccess;