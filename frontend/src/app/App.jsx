import Providers from "./providers";
import AppRouter from "./router";
import Navbar from "../components/layout/Navbar";

export default function App() {
  return (
    <Providers>
      <Navbar />

      <main className="min-h-screen pt-24">
        <AppRouter />
      </main>
    </Providers>
  );
}