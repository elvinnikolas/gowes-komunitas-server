const Faq = require('../../models/Faq')

module.exports = {
    Query: {
        async getFaqs() {
            try {
                const faqs = await Faq.find()
                return faqs

            } catch (error) {
                throw new Error(error)
            }
        }
    },
    Mutation: {
        async addFaqCategory(_, { category }) {

            if (category.trim() == '') {
                throw new Error('Category cannot be empty')
            }

            let faq = await Faq.findOne({ category: category })

            if (faq) {
                throw new Error('Category already exists')
            } else {
                try {
                    const newFaq = {
                        category: category,
                        contents: []
                    }

                    faq = new Faq(newFaq)
                    await faq.save()

                    return faq

                } catch (error) {
                    throw new Error(error)
                }
            }

        },

        async addFaq(_, { category, image, question, answer }) {

            if ((question.trim() == '') || (answer.trim() == '')) {
                throw new Error('All field must be filled')
            }

            try {
                const faq = await Faq.findOne({ category: category })

                if (faq) {
                    faq.contents.push({ image: image, question: question, answer: answer })
                } else {
                    throw new Error('Invalid category')
                }

                await faq.save()

                return faq

            } catch (error) {
                throw new Error(error)
            }
        },

        async removeFaq(_, { category }) {

            try {
                const faq = await Faq.findOne({ category: category })

                if (faq) {
                    await faq.remove()
                    return 'FAQ deleted successfully'

                } else {
                    throw new Error('Invalid FAQ')
                }

            } catch (error) {
                throw new Error(error)
            }
        }
    }
}