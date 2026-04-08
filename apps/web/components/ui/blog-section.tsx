"use client";

import { cn } from "@/lib/utils";

const blogs = [
  {
    id: 1,
    title: "How to Write a Winning Scholarship Essay",
    category: "Scholarship Tips",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    title: "Top 10 Fully Funded Scholarships for International Students",
    category: "Scholarships",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    title: "A Complete Guide to Studying in the UK",
    category: "Study Abroad",
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=600&auto=format&fit=crop&q=60",
  },
];

export default function BlogSection() {
  return (
    <section className="w-full py-20 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Tips, guides, and insights to help you succeed in your scholarship journey
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="max-w-sm w-full group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  src={blog.image}
                  alt={blog.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  {blog.category}
                </p>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mt-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {blog.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}