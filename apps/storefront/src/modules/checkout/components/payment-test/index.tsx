import { T } from "@lib/i18n/provider"
import { Badge } from "@modules/common/components/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold"><T>Atención:</T></span> For testing purposes
      only.
    </Badge>
  )
}

export default PaymentTest
