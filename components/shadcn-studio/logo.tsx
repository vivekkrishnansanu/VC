// SVG Imports
import LogoSvg from '@/assets/svg/logo'

// Util Imports
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoSvg className='h-8 w-8' />
      <span className='text-xl font-semibold'>shadcn/studio</span>
    </div>
  )
}

export default Logo

