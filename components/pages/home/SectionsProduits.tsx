import PhoneSlider from "@/components/phone-slider";

export default function SectionsProduits() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-10 text-center">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: "var(--biltx-blue)" }}
        >
          Solutions AI Preview
        </p>
        <h1 className="text-3xl font-bold text-foreground text-balance">
          Solutions AI&nbsp;
          <span style={{ color: "var(--biltx-blue)" }}>in Action</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty max-w-xs mx-auto">
          Manage bilties, invoices, and logistics — all in one place.
        </p>
      </div>

      <div className="relative w-full" style={{ maxWidth: "1100px", overflowX: "clip" }}>
        <PhoneSlider />
      </div>
    </main>
  );
}
