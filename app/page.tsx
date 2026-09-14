export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="mx-4 mt-4 sm:mt-10 flex w-full flex-row items-center justify-center gap-4 p-4">
        <span className="card">
          <p>Serving</p>
          <h1>0</h1>
        </span>

        <span className="card">
          <p>Waiting</p>
          <h1>0</h1>
        </span>

        <span className="card">
          <p>ETA</p>
          <h1>0</h1>
        </span>    
      </div>

      <div className="bg-foreground3 w-full p-4">
        <p>Now Serving</p>
        <h1>R-1</h1>
        <p>Name - Transaction Type</p>
        <button>Mark as Complete</button>
      
      </div>
    </main>
  );
}