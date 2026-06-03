import { propertyConfig } from '@/config/property'

export default function CancellationPolicy() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.97] p-5 text-luxury-dark shadow-lg backdrop-blur-sm dark:bg-[#1a1a1a]/[0.97] dark:text-white">
      <h3 className="font-serif text-xl font-bold">Cancellation Policy</h3>
      <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-300">
        {propertyConfig.policies.cancellation}
      </p>
    </div>
  )
}
