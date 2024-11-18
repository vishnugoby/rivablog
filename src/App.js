import { useState, useEffect } from "react";
import axios from "axios";

const SHARED_PASSWORD = "blogpass123";
const COOKIE_NAME = "blog_auth";
const SHEET_ID = "1lYuAFbwYq9HiNNyrKEb_5trtCPeXnUXH-5G1T5Wbm-g";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Using the public CSV export URL
      const response = await axios.get(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
      );

      // Parse CSV data
      const rows = response.data.split("\n");
      const headers = rows[0].split(",");

      console.log("headers", headers);

      const blogPosts = rows.slice(1).map((row) => {
        const values = row.split(",");
        return {
          title: values[0]?.trim() || "",
          content: values[1]?.trim() || "",
          author: values[2]?.trim() || "",
          date: values[3]?.trim() || "",
          link: values[4]?.trim() || "",
          important: values[5]?.trim() || "",
        };
      });

      const revesedBlogPosts = blogPosts.reverse();

      setBlogs(revesedBlogPosts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blog data:", error);
      setFetchError(
        "Failed to load blog posts. Please check your Google Sheet settings."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = document.cookie
      .split("; ")
      .find((row) => row.startsWith(COOKIE_NAME));
    if (auth) {
      setIsAuthenticated(true);
      fetchBlogs();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SHARED_PASSWORD) {
      document.cookie = `${COOKIE_NAME}=true; path=/; max-age=86400`;
      setIsAuthenticated(true);
      fetchBlogs();
      setError("");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  const handleLogout = () => {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Bienvenue à Riva Blog
            </h2>
            <p className="text-gray-600">
              Tappez le mot de passe partagé pour accéder aux articles de blog.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
            >
              Connexion à Riva Blog
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Riva Blog</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchBlogs}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                disabled={loading}
              >
                {loading ? "Rafraîchissement..." : "Rafraîchir"}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Chargement des blogs...</div>
          </div>
        ) : fetchError ? (
          <div className="text-center py-12">
            <div className="text-red-500">{fetchError}</div>
            <button
              onClick={fetchBlogs}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Réessayer
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600">
              Aucun article de blog trouvé. Assurez-vous que votre feuille
              Google est correctement formatée.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {blogs.map((blog, index) => (
              <article
                key={index}
                className="bg-white rounded-2xl shadow-lg  hover:shadow-xl transition-shadow"
              >
                <div className="p-8">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <span className="font-medium text-gray-400 capitalize">
                      {blog.author}
                    </span>
                    <span>•</span>
                    <time>{blog.date}</time>
                  </div>
                  {blog.important === "OUI" && (
                    <span className=" text-red-600  rounded-lg text-lg font-medium">
                      Important
                    </span>
                  )}

                  <h2 className="text-2xl font-bold text-gray-800 mb-4 hover:text-blue-600">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {blog.content}
                  </p>
                  {blog.link !== "NON" && (
                    <a
                      href={blog.link}
                      className="text-gray-600 leading-relaxed hover:text-blue-600 bg-slate-100 p-2 rounded-lg mt-3 block text-center"
                    >
                      Voir la attachement
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
