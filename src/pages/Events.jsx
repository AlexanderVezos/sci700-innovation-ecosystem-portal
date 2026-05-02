import PageTransition from "@/components/PageTransition";
import EventsPanel from "@/components/EventsPanel";

function Events() {
  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mt-3">
              What's
              <br />
              on.
            </h1>
            <p className="text-slate-400 mt-6 text-lg max-w-xl leading-relaxed">
              Networking nights, workshops, pitch events, and conferences across
              the Sunshine Coast. Add yours to the list.
            </p>
          </div>
        </div>
        <EventsPanel />
      </div>
    </PageTransition>
  );
}

export default Events;
