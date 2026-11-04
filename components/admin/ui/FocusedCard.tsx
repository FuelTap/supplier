// The white card that holds a focused page's form, under the FocusedHeader.
export default function FocusedCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 pt-10 pb-16">
      <section className="mx-auto w-full max-w-140 rounded-[2rem] border border-gray-100 bg-white/70 p-6 md:p-8">
        <h1 className="text-2xl text-black">{title}</h1>
        <p className="text-grey-800 mt-1 text-base leading-snug md:text-lg">
          {description}
        </p>
        {children}
      </section>
    </div>
  );
}
