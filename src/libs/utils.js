export function scrollTop(scrollDuration = 1000) {
  return new Promise((resolve, reject) => {
    const scrollHeight = window.scrollY
    const scrollStep = Math.PI / (scrollDuration / 18)
    const cosParameter = scrollHeight / 2
    let scrollCount = 0
    let scrollMargin
    requestAnimationFrame(step)

    function step() {
      setTimeout(function() {
        try {
          if (window.scrollY != 0) {
            requestAnimationFrame(step)
            scrollCount = scrollCount + 1
            scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep)
            window.scrollTo(0, (scrollHeight - scrollMargin))
          } else {
            resolve()
          }
        } catch(err) {
          reject(err)
        }
      }, 8)
    }
  })
}