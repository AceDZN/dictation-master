interface BackgroundGradientProps {
  position: 'top' | 'bottom'
}

export function BackgroundGradient({ position }: BackgroundGradientProps) {
  const isTop = position === 'top'
  
  return (
    <div
      className={`absolute inset-x-0 ${
        isTop ? '-top-40 sm:-top-80' : 'top-[calc(100%-13rem)] sm:top-[calc(100%-30rem)]'
      } -z-10 transform-gpu overflow-hidden blur-3xl`}
      aria-hidden="true"
    >
      <div
        className={`relative ${
          isTop
            ? 'left-[calc(50%-11rem)] bg-gradient-to-tr from-indigo-200 to-sky-200 sm:left-[calc(50%-30rem)]'
            : 'left-[calc(50%+3rem)] bg-gradient-to-tr from-sky-200 to-indigo-200 sm:left-[calc(50%+36rem)]'
        } aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] opacity-20 sm:w-[72.1875rem]`}
        style={{
          clipPath:
            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
        }}
      />
    </div>
  )
} 