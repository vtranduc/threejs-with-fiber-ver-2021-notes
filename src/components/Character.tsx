import { CharacterProps } from '../types'

export function Character(props: CharacterProps) {
  function getContent() {
    return (
      <>
        <primitive object={props.bone} />
        {props.skinnedMeshes.map((mesh, i) => (
          <skinnedMesh key={i} {...mesh} />
        ))}
      </>
    )
  }

  function wrapGroups(groups: JSX.IntrinsicElements['group'][]) {
    if (!groups.length) return getContent()
    return <group {...groups[0]}>{wrapGroups(groups.slice(1))}</group>
  }

  return (
    <group ref={props.characterRef} {...props.groups[0]} dispose={null}>
      {wrapGroups(props.groups.slice(1))}
    </group>
  )
}
