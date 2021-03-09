module.exports.validateRegisterInput = (
    name,
    email,
    password
) => {
    const errors = {};
    if (name.trim() === '') {
        errors.name = 'Name can not be empty';
    }
    if (email.trim() === '') {
        errors.email = 'Email can not be empty';
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Invalid email address';
        }
    }
    if (password === '') {
        errors.password = 'Password can not empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
};

module.exports.validateLoginInput = (email, password) => {
    const errors = {};
    if (email.trim() === '') {
        errors.email = 'Email can not be empty';
    }
    if (password.trim() === '') {
        errors.password = 'Password can not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
};
