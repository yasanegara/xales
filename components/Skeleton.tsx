interface SkProps {
  w?: string | number
  h?: string | number
  r?: string | number
  style?: React.CSSProperties
}

export function Sk({ w = '100%', h = '1rem', r = '6px', style }: SkProps) {
  return (
    <div
      className="skel"
      style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  )
}
