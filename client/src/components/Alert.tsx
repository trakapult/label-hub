interface Props {
  children: React.ReactNode
}

function Alert({children}: Props) {
  return <div className="alert alert-primary">{children}</div>
}

export default Alert