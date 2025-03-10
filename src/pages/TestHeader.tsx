import { HeaderDemo } from "../components/ui/header-demo";

const TestHeader = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <HeaderDemo />
      <div className="pt-32 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">Test Page for Header Component</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          This page demonstrates the Header1 component with shadcn UI integration.
        </p>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
            <li>Responsive navigation menu</li>
            <li>Mobile-friendly design with hamburger menu</li>
            <li>Dropdown menus for complex navigation structures</li>
            <li>Dark mode support</li>
            <li>Consistent with shadcn UI design system</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestHeader; 