import db from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export const handleIsProjectBelongToThisUser = async (
    projectId: string,
    userId: string
) => {
    try {
        const projectRef = doc(db, `/projects/${projectId}`)
        const project = (await getDoc(projectRef)).data()
        return project?.userId === userId
    } catch (error) {
        return false
    }
}
