import FindCentreClient from "./FindCentreClient";

export default function FindCentrePage() {
  return (
    <div className="space-y-4 md:px-8 py-4 xl:pr-12">
      <h1 className="text-2xl font-bold text-primary">Find INEC Centre</h1>
      <p className="text-muted-foreground">
        Search for the nearest INEC registration or collection centre.
      </p>
      <hr className="text-gray-600 font-semibold my-6" />
      <FindCentreClient />
    </div>
  );
}
