import { ShieldCheckIcon, LockClosedIcon, KeyIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'End-to-end Encryption',
    description: 'Your messages and files are encrypted before they leave your device, ensuring only intended recipients can access them.',
    icon: LockClosedIcon,
  },
  {
    name: 'Zero Knowledge Architecture',
    description: 'We cannot read your messages or access your data. Your privacy is guaranteed by design.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Multi-Factor Authentication',
    description: 'Secure your account with multiple layers of authentication, including hardware security keys.',
    icon: KeyIcon,
  },
  {
    name: 'Team Collaboration',
    description: 'Secure group messaging, file sharing, and real-time collaboration tools for your team.',
    icon: UserGroupIcon,
  },
]

export default function Features() {
  return (
    <div className="bg-white py-24" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Enterprise-grade Security
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Built with security and privacy as core principles, not afterthoughts.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <feature.icon className="h-8 w-8" aria-hidden="true" />
                </div>
                <p className="ml-16 text-xl font-semibold leading-6 text-gray-900">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
