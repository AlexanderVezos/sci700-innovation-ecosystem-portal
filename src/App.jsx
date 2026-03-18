import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

function App() {
  return (
    <div>
      <Sheet>
        <SheetTrigger className="p-4 text-lg font-bold">☰ Menu</SheetTrigger>
        <SheetContent>
          <nav className="flex flex-col gap-4 mt-8">
            <a href="#" className="text-lg font-medium hover:text-green-600">Home</a>
            <a href="#" className="text-lg font-medium hover:text-green-600">About</a>
            <a href="#" className="text-lg font-medium hover:text-green-600">Contact</a>
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="text-4xl font-bold text-green-800">Hello Portal</h1>
    </div>
  )
}

export default App