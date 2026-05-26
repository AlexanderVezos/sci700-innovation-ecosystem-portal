import PageTransition from "@/components/PageTransition";
import OppsPanel from "@/components/OppsPanel";

function Opportunities() {
  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              Open for
              <br />
              collaboration.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              Post a pilot, challenge, or co-development call. Find
              organisations ready to work with you.
            </p>
          </div>
        </div>
        <OppsPanel />
      </div>
    </PageTransition>
  );
}

export default Opportunities;
