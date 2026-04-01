import Table from "@/components/Table";
import PageTransition from "@/components/PageTransition";

function Events() {
  return (
    <PageTransition>
      <div className="bg-slate-50 flex flex-col items-center gap-8 p-8 pt-24">
        <Table />
      </div>
    </PageTransition>
  );
}

export default Events;
