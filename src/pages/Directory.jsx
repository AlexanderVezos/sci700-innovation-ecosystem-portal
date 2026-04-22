import Table from "@/components/Table";
import PageTransition from "@/components/PageTransition";

function Directory() {
  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              Who's building
              <br />
              on the Coast.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">Browse startups, investors, research institutions, and industry partners shaping the Sunshine Coast innovation ecosystem.</p>
          </div>
        </div>
        <div className="px-8 md:px-16 py-12 max-w-2xl mx-auto">
          <Table />
        </div>
      </div>
    </PageTransition>
  );
}

export default Directory;
