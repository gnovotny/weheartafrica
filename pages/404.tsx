import { Text } from '@components/ui'

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center w-full max-w-2xl px-8 py-20 sm:mx-auto fit'>
      <Text variant='heading'>Not Found</Text>
      <Text className=''>The requested page doesn't exist or you don't have access to it.</Text>
    </div>
  )
}
