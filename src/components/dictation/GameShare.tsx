'use client'

import { useState, useMemo, useCallback, ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { ShareIcon } from '@heroicons/react/24/outline'
import { APP_URL } from '@/lib/client-constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GameShareConfig {
  id: string
  title: string
  description?: string
}

interface UseGameShareResult {
  handleShareClick: () => Promise<void> | void
  shareDialog: ReactNode
}

export function useGameShare(config: GameShareConfig): UseGameShareResult {
  const { id, title } = config
  const t = useTranslations('Dictation.card')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const normalizedAppUrl = useMemo(() => APP_URL.replace(/\/$/, ''), [])
  const shareUrl = useMemo(() => `${normalizedAppUrl}/dictation/play/${id}`, [normalizedAppUrl, id])
  const shareMessage = t('shareMessage', { title })
  const encodedUrl = encodeURIComponent(shareUrl)
  const socialLinks = useMemo(() => [
    {
      id: 'twitter',
      label: t('shareTwitter'),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`,
    },
    {
      id: 'facebook',
      label: t('shareFacebook'),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: 'linkedin',
      label: t('shareLinkedIn'),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: 'whatsapp',
      label: t('shareWhatsApp'),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`,
    },
  ], [encodedUrl, shareMessage, shareUrl, t])

  const canUseNativeShare = () => {
    if (typeof navigator === 'undefined') {
      return false
    }
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    return isMobile && typeof navigator.share === 'function'
  }

  const handleNativeShare = useCallback(async () => {
    if (!canUseNativeShare()) {
      return false
    }
    try {
      await navigator.share({
        title,
        text: shareMessage,
        url: shareUrl,
      })
      return true
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        toast.error(t('shareError'))
      }
      return false
    }
  }, [shareMessage, shareUrl, title, t])

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = shareUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopyState('copied')
      toast.success(t('shareCopied'))
    } catch {
      toast.error(t('shareError'))
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsShareOpen(open)
    if (!open) {
      setCopyState('idle')
    }
  }

  const handleShareClick = async () => {
    const shared = await handleNativeShare()
    if (!shared) {
      // Small delay to ensure dropdown closes before dialog opens
      setTimeout(() => {
        setIsShareOpen(true)
      }, 100)
    }
  }

  const shareDialog = (
    <Dialog open={isShareOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('shareTitle')}</DialogTitle>
          <DialogDescription>{t('shareDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`share-link-${id}`} className="text-sm text-gray-600">
              {t('shareLinkLabel')}
            </Label>
            <div className="flex w-full">
              <Input
                id={`share-link-${id}`}
                value={shareUrl}
                readOnly
                onClick={handleCopyLink}
                className="cursor-pointer rounded-r-none border-r-0 focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="secondary"
                className="rounded-l-none border border-l-0 border-input h-auto leading-none px-4 py-0 text-sm whitespace-nowrap"
                onClick={handleCopyLink}
              >
                {copyState === 'copied' ? t('shareCopied') : t('shareCopy')}
              </Button>
            </div>
            <p className="text-xs text-gray-500">{t('shareHint')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{t('shareOn')}</p>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((platform) => (
                <Button
                  key={platform.id}
                  variant="outline"
                  className="w-full justify-center rounded-lg border border-gray-200"
                  asChild
                >
                  <a href={platform.href} target="_blank" rel="noreferrer">
                    {platform.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return {
    handleShareClick,
    shareDialog,
  }
}

interface GameShareButtonProps extends GameShareConfig {
  label: string
  className?: string
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  hideIcon?: boolean
}

export function GameShareButton({
  label,
  className,
  variant = 'outline',
  size = 'default',
  hideIcon = false,
  ...config
}: GameShareButtonProps) {
  const { handleShareClick, shareDialog } = useGameShare(config)
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          'rounded-lg border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 flex items-center gap-2',
          className
        )}
        onClick={handleShareClick}
      >
        {!hideIcon && <ShareIcon className="h-4 w-4" />}
        {label}
      </Button>
      {shareDialog}
    </>
  )
}

