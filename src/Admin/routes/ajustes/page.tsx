import UserProfile from "../../components/UserProfile";

const AjustesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <UserProfile />
      </div>
    </div>
  );
};

export default AjustesPage;