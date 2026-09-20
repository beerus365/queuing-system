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

      <div className="mx-4 mt-2 flex w-[calc(100%-2rem)] flex-col justify-center gap-2 p-6 sm:mt-4 sm:p-8 bg-foreground3 text-white rounded-lg">
        <p className="text-sm sm:text-base">Now Serving</p>
        <h1 className="text-3xl font-bold sm:text-6xl">R-1</h1>
        <p className="text-sm sm:text-lg">Name - Transaction Type</p>
        <button className="flex flex-row justify-center items-center gap-4 bg-button-bg hover:bg-button-hover text-white py-4 rounded-lg mt-4 cursor-pointer">
          <svg 
            viewBox="0 0 24 24" 
            id="check-mark-circle-2" 
            xmlns="http://www.w3.org/2000/svg" 
            className="icon line w-8 h-8 sm:w-10 sm:h-10"
          >
            <path 
              id="primary" 
              d="M20.94,11A8.26,8.26,0,0,1,21,12a9,9,0,1,1-9-9,8.83,8.83,0,0,1,4,1" 
              style={{ fill: "none", stroke: "#ffffff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }}
            />
            <polyline 
              id="primary-2" 
              data-name="primary" 
              points="21 5 12 14 8 10" 
              style={{ fill: "none", stroke: "#ffffff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }}
            />
          </svg>
          Mark as Served
        </button>
      </div>

      <div className="mx-4 mt-4 flex w-[calc(100%-2rem)] flex-col justify-center gap-2 py-4 px-6 sm:mt-8 sm:py-6 sm:px-6 bg-foreground2 text-black rounded-lg">
        <span>
          <p className="text-xs text-gray-500 sm:text-base">Waiting queue</p>
          <span>
            <svg width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-person">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
          </span>
        </span>
        <ul>
          <li>R-2</li>
          <li>R-3</li>
          <li>R-4</li>
        </ul>
      </div>
    </main>
  );
}