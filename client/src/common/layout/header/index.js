import { useAuth } from '@/lib/hooks/useAuth'
import { useAvailableTheme } from '@/lib/hooks/useAvailableTheme'
import { useUser } from '@/lib/hooks/useUser'
import { supabase } from '@/lib/supabase'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { setSyncSWR } from 'swr-sync-state'
import useSWRMutation from 'swr/mutation'

export const Header = () => {
  const theme = useAvailableTheme() ?? []
  const auth = useAuth()
  const user = useUser()
  const router = useRouter()
  const signOutAPI = useSWRMutation('api/auth', async () => {
    const { error } = await supabase.auth.signOut()
    return error
  })
  const themeAPI = useSWRMutation(auth?.data?.user?.id && `api/user/${auth.data.user.id}`, async (key, { arg }) => {
    await supabase
      .from('users')
      .update({ 'theme': arg })
      .eq('uuid', auth.data.user.id)
      .throwOnError()
  })
  const avatarURL = auth?.data?.user?.user_metadata?.avatar_url

  const showSignInComponent = () => {
    setSyncSWR('show/signInComponent', true)
  }

  const signOutHandler = () => {
    signOutAPI.trigger()
  }

  const navigateToLanding = () => {
    router.push('/')
  }

  const navigateToCreatePin = () => {
    router.push('/createPin')
  }

  const themeHandler = (e) => {
    const updatedValue = e.target.textContent
    if (auth.data) {
      const options = {
        optimisticData: {
          ...user.data,
          theme: updatedValue
        },
      }
      themeAPI.trigger(updatedValue, options)
    } else {
      document.querySelector('html').setAttribute('data-theme', updatedValue)
    }
  }

  const navigateToProfile = () => {
    router.push('/profile')
  }

  return (
    <div className="flex bg-neutral z-20 items-center text-neutral-content">
      <div className="flex-1 px-2 lg:flex-none flex items-center gap-1 cursor-pointer">
        <div onClick={navigateToLanding} className="lg:flex-none flex items-center gap-1 cursor-pointer">
          <div className='w-12'>
            <Image
              alt="pinterest logo"
              src="https://hffebrjtrzopihuffrxv.supabase.co/storage/v1/object/public/assets/pinterest-logo.png"
              width="0"
              priority={true}
              height="0"
              sizes="100vw"
              className='w-auto'
            />
          </div>
          <a className="text-lg font-bold hidden sm:block" >Pinterest</a>
        </div>
      </div>
      <div className="flex justify-end flex-1 px-2 items-center">
        {auth.data &&
          <button className="btn btn-ghost rounded-btn p-2" onClick={navigateToCreatePin}>
            <a className='hidden sm:block'>
              Create
            </a>
            <div className=' sm:hidden' >
              <AddIcon />
            </div>
          </button>
        }
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn p-2 btn-ghost rounded-btn">
            <label className='hidden sm:block'>
              Theme
            </label>
            <div className='sm:hidden'>
              <ColorLensIcon />
            </div>
          </button>
          <ul
            tabIndex={0}
            className="menu dropdown-content p-2 shadow rounded-box w-52 mt-4 grid grid-cols-1 overflow-y-scroll max-h-screen bg-neutral z-50"
          >
            {theme && theme.map((el, index) => {
              return (
                <li key={index} className='text-neutral-content bg-neutral z-50'>
                  <a
                    onClick={themeHandler}
                  >
                    {el}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
        {!auth.data ? (
          <button className="btn btn-ghost rounded-btn p-2" onClick={showSignInComponent}>
            <a className='hidden sm:block' >
              Sign In
            </a>
            <div className='sm:hidden' >
              <LoginIcon />
            </div>
          </button>
        ) : (
          <button className='btn btn-ghost rounded-btn p-2' onClick={signOutHandler}>
            <a className="hidden sm:block" >
              Sign Out
            </a>
            <div className='sm:hidden'>
              <LogoutIcon />
            </div>
          </button>
        )}
        <button className='btn btn-ghost rounded-btn flex items-center justify-center'
          onClick={navigateToProfile}>
          <div className="avatar aspect-square">
            {avatarURL
              ?
              <div className="rounded-full flex items-center w-7">
                <Image src={avatarURL}
                  alt="avatar"
                  width="6"
                  height="6"
                  className="aspect-square w-2"
                  id="user_avatar"
                />

              </div>
              :
              <AccountCircleIcon className='text-2xl' />
            }
          </div>

        </button>
      </div>
    </div>
  )
}
