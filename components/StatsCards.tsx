'use client'

const cards = [
  {
    stat: '120+',
    label: '5-Star Reviews',
    sub: 'Consistently praised by guests for exceptional stays',
    icon: '★',
  },
  {
    stat: '1,000+',
    label: 'Guests Per Year',
    sub: 'Welcoming travellers from around the world',
    icon: '♥',
  },
]

export default function StatsCards() {
  return (
    <section className="bg-white star-section py-10 md:py-14">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: '#141414',
                border: '1px solid #2c2c2c',
              }}
            >
              {/* Decorative lines */}
              <span
                className="absolute left-[10%] right-[10%] h-px top-[10%]"
                style={{ background: 'linear-gradient(90deg, #888 30%, #1d1f1f 70%)' }}
              />
              <span
                className="absolute left-[10%] right-[10%] h-px bottom-[10%]"
                style={{ background: '#2c2c2c' }}
              />
              <span
                className="absolute top-[10%] bottom-[10%] w-px left-[10%]"
                style={{ background: 'linear-gradient(180deg, #747474 30%, #222424 70%)' }}
              />
              <span
                className="absolute top-[10%] bottom-[10%] w-px right-[10%]"
                style={{ background: '#2c2c2c' }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center px-8 py-10 gap-3">
                <span className="text-3xl" style={{ color: '#c9a96e' }}>
                  {card.icon}
                </span>
                <span
                  className="text-5xl font-bold leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 40%, #888 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {card.stat}
                </span>
                <span
                  className="text-lg font-semibold tracking-wide uppercase"
                  style={{ color: '#c9a96e', letterSpacing: '0.08em' }}
                >
                  {card.label}
                </span>
                <span className="text-sm" style={{ color: '#888' }}>
                  {card.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
